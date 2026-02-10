import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Thread } from '../../core/models/chat.models';
import { DocumentSummary } from '../../core/models/document.models';
import * as ChatActions from '../../store/chat/chat.actions';
import {
  selectThreads,
  selectCurrentThreadId
} from '../../store/chat/chat.selectors';
import { selectLatestDocument } from '../../store/document/document.selectors';

import { ThreadListComponent } from './thread-list/thread-list.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    ThreadListComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() newChatClicked = new EventEmitter<void>();
  @Output() threadSelected = new EventEmitter<string>();
  
  threads$: Observable<Thread[]>;
  currentThreadId$: Observable<string | null>;

  constructor(private store: Store) {
    this.threads$ = this.store.select(selectThreads);
    this.currentThreadId$ = this.store.select(selectCurrentThreadId);
  }

  ngOnInit(): void {
    this.store.dispatch(ChatActions.loadThreads());
  }

  onNewChat(): void {
    // Check if there's already an empty "New Conversation"
    this.threads$.pipe(
      take(1)
    ).subscribe(threads => {
      const emptyNewConversation = threads.find(
        thread => thread.title === 'New Conversation' && thread.messageCount === 0
      );

      if (emptyNewConversation) {
        // Switch to existing empty conversation instead of creating new one
        this.store.dispatch(ChatActions.setCurrentThread({ threadId: emptyNewConversation.id }));
      } else {
        // Create new conversation
        this.store.dispatch(ChatActions.createNewThread());
      }
      
      // Emit event to close sidebar in mobile view
      this.newChatClicked.emit();
    });
  }
  
  onThreadSelected(threadId: string): void {
    // Forward the thread selection event
    this.threadSelected.emit(threadId);
  }
}
