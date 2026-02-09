import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Thread, ChatRequest, ChatResponse, MessageRole } from '../models/chat.models';
import { environment } from '../../../environments/environment';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all threads for current user (managed locally)
   */
  getAllThreads(): Observable<Thread[]> {
    // Threads are managed locally in NgRx store
    const storedThreads = localStorage.getItem('chat_threads');
    const threads = storedThreads ? JSON.parse(storedThreads) : [];
    return new Observable(observer => {
      observer.next(threads);
      observer.complete();
    });
  }

  /**
   * Create a new thread (managed locally)
   */
  createThread(): Observable<Thread> {
    const newThread: Thread = {
      id: generateUUID(),
      userId: 'local-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      title: 'New Conversation'
    };
    
    // Save to localStorage
    const storedThreads = localStorage.getItem('chat_threads');
    const threads = storedThreads ? JSON.parse(storedThreads) : [];
    threads.push(newThread);
    localStorage.setItem('chat_threads', JSON.stringify(threads));
    
    return new Observable(observer => {
      observer.next(newThread);
      observer.complete();
    });
  }

  /**
   * Get messages for a specific thread (managed locally)
   */
  getMessages(threadId: string): Observable<Message[]> {
    const storedMessages = localStorage.getItem(`chat_messages_${threadId}`);
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    return new Observable(observer => {
      observer.next(messages);
      observer.complete();
    });
  }

  /**
   * Send message to backend API
   */
  sendMessage(content: string, threadId: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      message: content,
      thread_id: threadId
    };

    return this.http.post<ChatResponse>(`${this.API_URL}/chat`, request);
  }

  /**
   * Delete a thread (managed locally)
   */
  deleteThread(threadId: string): Observable<void> {
    const storedThreads = localStorage.getItem('chat_threads');
    if (storedThreads) {
      const threads = JSON.parse(storedThreads).filter((t: Thread) => t.id !== threadId);
      localStorage.setItem('chat_threads', JSON.stringify(threads));
      localStorage.removeItem(`chat_messages_${threadId}`);
    }
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Update thread title (managed locally)
   */
  updateThreadTitle(threadId: string, title: string): Observable<Thread> {
    const storedThreads = localStorage.getItem('chat_threads');
    if (storedThreads) {
      const threads = JSON.parse(storedThreads);
      const thread = threads.find((t: Thread) => t.id === threadId);
      if (thread) {
        thread.title = title;
        thread.updatedAt = new Date();
        localStorage.setItem('chat_threads', JSON.stringify(threads));
        return new Observable(observer => {
          observer.next(thread);
          observer.complete();
        });
      }
    }
    return new Observable(observer => {
      observer.error('Thread not found');
    });
  }

  /**
   * Save message locally
   */
  saveMessage(message: Message): void {
    const storedMessages = localStorage.getItem(`chat_messages_${message.threadId}`);
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    messages.push(message);
    localStorage.setItem(`chat_messages_${message.threadId}`, JSON.stringify(messages));
  }
}
