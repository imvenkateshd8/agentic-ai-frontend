import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { Thread } from '../../../core/models/chat.models';
import * as ChatActions from '../../../store/chat/chat.actions';

@Component({
  selector: 'app-thread-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './thread-list.component.html',
  styleUrls: ['./thread-list.component.scss']
})
export class ThreadListComponent {
  @Input() threads: Thread[] | null = [];
  @Input() currentThreadId: string | null = null;
  @Output() threadSelected = new EventEmitter<string>();

  constructor(private store: Store) {}

  onSelectThread(threadId: string): void {
    // Only change current thread, messages already in state from localStorage
    this.store.dispatch(ChatActions.setCurrentThread({ threadId }));
    // Emit event for parent components
    this.threadSelected.emit(threadId);
  }

  isActive(threadId: string): boolean {
    return this.currentThreadId === threadId;
  }

  trackByThreadId(index: number, thread: Thread): string {
    return thread.id;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const threadDate = new Date(date);
    const diff = now.getTime() - threadDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return threadDate.toLocaleDateString();
  }
}
