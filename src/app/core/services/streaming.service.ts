import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { StreamChunk, MessageType, MessageRole } from '../models/chat.models';
import * as ChatActions from '../../store/chat/chat.actions';

/**
 * Service to handle Server-Sent Events (SSE) streaming from the backend
 * Mimics the streaming behavior from the Streamlit frontend
 */
@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private eventSource: EventSource | null = null;

  constructor(private store: Store) {}

  /**
   * Establish SSE connection and handle streaming messages
   * Based on the ai_only_stream() generator from Streamlit
   */
  streamMessages(
    userMessage: string,
    threadId: string,
    apiUrl: string
  ): Observable<StreamChunk> {
    const streamSubject = new Subject<StreamChunk>();

    // Dispatch start streaming action
    this.store.dispatch(ChatActions.startStreaming());

    // Build SSE URL with query parameters
    const url = new URL(`${apiUrl}/chat/stream`);
    url.searchParams.append('threadId', threadId);
    url.searchParams.append('message', userMessage);

    // Create EventSource connection
    this.eventSource = new EventSource(url.toString());

    // Handle incoming messages
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'chunk') {
          const chunk: StreamChunk = {
            type: data.messageType || MessageType.AI,
            content: data.content || '',
            metadata: data.metadata,
            name: data.name
          };

          // Handle tool messages (like ToolMessage in Streamlit)
          if (data.messageType === MessageType.TOOL) {
            this.store.dispatch(
              ChatActions.updateToolStatus({
                toolStatus: {
                  name: data.name || 'tool',
                  status: 'running',
                  message: `Using ${data.name || 'tool'}...`
                }
              })
            );
          }

          // Handle AI message chunks (streaming response)
          if (data.messageType === MessageType.AI && data.content) {
            this.store.dispatch(
              ChatActions.streamChunk({
                chunk,
                threadId
              })
            );
          }

          streamSubject.next(chunk);
        } else if (data.type === 'complete') {
          // Stream complete
          const finalMessage = {
            id: Date.now().toString(),
            threadId,
            role: MessageRole.ASSISTANT,
            content: data.content || '',
            timestamp: new Date(),
            metadata: data.metadata
          };

          this.store.dispatch(ChatActions.streamComplete({ message: finalMessage }));
          this.store.dispatch(ChatActions.clearToolStatus());

          streamSubject.complete();
          this.closeConnection();
        } else if (data.type === 'error') {
          throw new Error(data.message || 'Streaming error');
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        streamSubject.error(error);
      }
    };

    // Handle errors
    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.store.dispatch(
        ChatActions.streamError({ error: 'Connection error occurred' })
      );
      streamSubject.error(error);
      this.closeConnection();
    };

    return streamSubject.asObservable();
  }

  /**
   * Alternative approach: Fetch API with ReadableStream
   * More control over the streaming process
   */
  async streamWithFetch(
    userMessage: string,
    threadId: string,
    apiUrl: string
  ): Promise<void> {
    this.store.dispatch(ChatActions.startStreaming());

    const response = await fetch(`${apiUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        messages: [{ content: userMessage, role: 'user' }],
        config: {
          threadId,
          metadata: { threadId },
          runName: 'chat_turn'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Streaming request failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        this.store.dispatch(ChatActions.clearToolStatus());
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);

            if (data.type === 'chunk') {
              const chunk: StreamChunk = {
                type: data.messageType,
                content: data.content,
                metadata: data.metadata,
                name: data.name
              };

              if (data.messageType === MessageType.TOOL) {
                this.store.dispatch(
                  ChatActions.updateToolStatus({
                    toolStatus: {
                      name: data.name || 'tool',
                      status: 'running',
                      message: `Using ${data.name}...`
                    }
                  })
                );
              }

              if (data.messageType === MessageType.AI) {
                this.store.dispatch(ChatActions.streamChunk({ chunk, threadId }));
              }
            } else if (data.type === 'complete') {
              const finalMessage = {
                id: Date.now().toString(),
                threadId,
                role: MessageRole.ASSISTANT,
                content: data.content,
                timestamp: new Date()
              };

              this.store.dispatch(ChatActions.streamComplete({ message: finalMessage }));
            }
          } catch (error) {
            console.error('Error parsing chunk:', error);
          }
        }
      }
    }
  }

  /**
   * Close the SSE connection
   */
  closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
