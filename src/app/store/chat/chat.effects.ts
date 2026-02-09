import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, switchMap, mergeMap } from 'rxjs/operators';
import * as ChatActions from './chat.actions';
import { ChatService } from '../../core/services/chat.service';
import { MessageRole } from '../../core/models/chat.models';

@Injectable()
export class ChatEffects {
  loadThreads$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadThreads),
      switchMap(() => {
        // Load all threads and their messages from localStorage
        const storedThreads = localStorage.getItem('chat_threads');
        const threads = storedThreads ? JSON.parse(storedThreads) : [];
        
        // Load all messages for all threads from localStorage
        const allMessages: { [key: string]: any[] } = {};
        threads.forEach((thread: any) => {
          const storedMessages = localStorage.getItem(`chat_messages_${thread.id}`);
          allMessages[thread.id] = storedMessages ? JSON.parse(storedMessages) : [];
        });
        
        return [
          ChatActions.loadThreadsSuccess({ threads }),
          ChatActions.loadAllMessagesSuccess({ messages: allMessages })
        ];
      }),
      catchError((error) =>
        of(ChatActions.loadThreadsFailure({ error: error.message }))
      )
    )
  );

  createNewThread$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.createNewThread),
      switchMap(() => {
        // Generate new thread ID
        const threadId = this.generateUUID();
        const newThread = {
          id: threadId,
          userId: 'local-user',
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 0,
          title: 'New Conversation'
        };
        
        // Save to localStorage
        const storedThreads = localStorage.getItem('chat_threads');
        const threads = storedThreads ? JSON.parse(storedThreads) : [];
        threads.unshift(newThread);
        localStorage.setItem('chat_threads', JSON.stringify(threads));
        
        // Initialize empty message array for this thread
        localStorage.setItem(`chat_messages_${threadId}`, JSON.stringify([]));
        
        return of(ChatActions.createNewThreadSuccess({ thread: newThread }));
      }),
      catchError((error) =>
        of(ChatActions.loadThreadsFailure({ error: error.message }))
      )
    )
  );

  // Messages are already in state from loadThreads, no need to fetch again
  // loadMessages effect removed - switching threads is instant

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      exhaustMap(({ content, threadId, attachedDocument }) => {
        // User message is already added to state by reducer
        // Just save it to localStorage and call API
        const userMessage = {
          id: Date.now().toString(),
          threadId,
          role: MessageRole.USER,
          content,
          timestamp: new Date(),
          attachedDocument
        };
        
        // Save user message locally
        this.chatService.saveMessage(userMessage);
        
        return this.chatService.sendMessage(content, threadId).pipe(
          mergeMap((response) => {
            // Create assistant message from response
            const assistantMessage = {
              id: (Date.now() + 1).toString(),
              threadId: response.thread_id,
              role: MessageRole.ASSISTANT,
              content: response.answer,
              timestamp: new Date(),
              metadata: {
                sources: response.sources
              }
            };
            
            // Save assistant message locally
            this.chatService.saveMessage(assistantMessage);
            
            // Dispatch only assistant message success (user message already in state)
            return [
              ChatActions.sendMessageSuccess({ message: assistantMessage })
            ];
          }),
          catchError((error) =>
            of(ChatActions.sendMessageFailure({ error: error.message }))
          )
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private chatService: ChatService
  ) {}

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
