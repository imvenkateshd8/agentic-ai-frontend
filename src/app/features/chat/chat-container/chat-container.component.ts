import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

import { Message, Thread, ToolStatus } from '../../../core/models/chat.models';
import * as ChatActions from '../../../store/chat/chat.actions';
import * as AuthActions from '../../../store/auth/auth.actions';
import * as DocumentActions from '../../../store/document/document.actions';
import {
  selectCurrentMessages,
  selectCurrentThread,
  selectIsStreaming,
  selectToolStatus,
  selectIsWaitingForResponse,
  selectCurrentThreadId,
  selectThreads
} from '../../../store/chat/chat.selectors';
import { selectUser } from '../../../store/auth/auth.selectors';

import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { ToolStatusComponent } from '../tool-status/tool-status.component';
import { DocumentUploadModalComponent } from '../document-upload-modal/document-upload-modal.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    ChatMessageComponent,
    ChatInputComponent,
    SidebarComponent,
    ToolStatusComponent
  ],
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss']
})
export class ChatContainerComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild(ChatInputComponent) chatInputRef!: ChatInputComponent;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  messages$: Observable<Message[]>;
  currentThread$: Observable<Thread | null>;
  isStreaming$: Observable<boolean>;
  isWaitingForResponse$: Observable<boolean>;
  toolStatus$: Observable<ToolStatus | null>;
  user$: Observable<any>;
  currentThreadId$: Observable<string | null>;
  threads$: Observable<Thread[]>;
  
  isMobileView = false;
  sidenavOpened = false;
  
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;
  private readonly MOBILE_BREAKPOINT = 768;

  constructor(
    private store: Store,
    private dialog: MatDialog
  ) {
    this.messages$ = this.store.select(selectCurrentMessages);
    this.currentThread$ = this.store.select(selectCurrentThread);
    this.isStreaming$ = this.store.select(selectIsStreaming);
    this.isWaitingForResponse$ = this.store.select(selectIsWaitingForResponse);
    this.toolStatus$ = this.store.select(selectToolStatus);
    this.user$ = this.store.select(selectUser);
    this.currentThreadId$ = this.store.select(selectCurrentThreadId);
    this.threads$ = this.store.select(selectThreads);
  }

  ngOnInit(): void {
    // Check initial screen size
    this.checkScreenSize();
    
    // Load all threads and messages from localStorage
    this.store.dispatch(ChatActions.loadThreads());
    
    // Auto-create first thread if none exist
    this.store.select(selectThreads).pipe(
      takeUntil(this.destroy$)
    ).subscribe(threads => {
      if (threads.length === 0) {
        this.store.dispatch(ChatActions.createNewThread());
      } else if (!localStorage.getItem('currentThreadId')) {
        // Set first thread as current if no thread is selected
        this.store.dispatch(ChatActions.setCurrentThread({ threadId: threads[0].id }));
      }
    });
    
    // Subscribe to messages to trigger scroll on new messages
    this.messages$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Only scroll if we explicitly requested it (via shouldScrollToBottom flag)
      // This prevents unwanted scrolling when just switching threads
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSendMessage(payload: {text: string, attachedDocument?: string}): void {
    let currentThreadId: string | null = null;
    
    // Get current thread ID synchronously
    this.currentThreadId$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      currentThreadId = id;
    }).unsubscribe();
    
    if (currentThreadId) {
      // Thread exists, send message
      this.store.dispatch(ChatActions.sendMessage({ 
        content: payload.text, 
        threadId: currentThreadId,
        attachedDocument: payload.attachedDocument
      }));
      this.shouldScrollToBottom = true;
      
      // Clear the attachment from input after sending
      if (payload.attachedDocument && this.chatInputRef) {
        this.chatInputRef.clearAttachment();
      }
    } else {
      // No thread, create one first then send message
      this.store.dispatch(ChatActions.createNewThread());
      // Wait a tick for thread to be created in state
      setTimeout(() => {
        this.currentThreadId$.pipe(takeUntil(this.destroy$)).subscribe(threadId => {
          if (threadId) {
            this.store.dispatch(ChatActions.sendMessage({ 
              content: payload.text, 
              threadId,
              attachedDocument: payload.attachedDocument
            }));
            this.shouldScrollToBottom = true;
            
            // Clear the attachment from input after sending
            if (payload.attachedDocument && this.chatInputRef) {
              this.chatInputRef.clearAttachment();
            }
          }
        }).unsubscribe();
      }, 10);
    }
  }

  onFileUpload(): void {
    let currentThreadId: string | null = null;
    
    this.currentThreadId$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      currentThreadId = id;
    }).unsubscribe();
    
    // Create thread if needed
    if (!currentThreadId) {
      this.store.dispatch(ChatActions.createNewThread());
      setTimeout(() => {
        this.currentThreadId$.pipe(takeUntil(this.destroy$)).subscribe(threadId => {
          if (threadId) {
            this.openUploadModal(threadId);
          }
        }).unsubscribe();
      }, 10);
    } else {
      this.openUploadModal(currentThreadId);
    }
  }

  private openUploadModal(threadId: string): void {
    const dialogRef = this.dialog.open(DocumentUploadModalComponent, {
      width: '420px',
      maxWidth: '95vw',
      maxHeight: '80vh',
      disableClose: false,
      panelClass: 'document-upload-modal',
      data: { threadId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.attached && this.chatInputRef) {
        this.chatInputRef.attachDocument(result.filename);
      }
    });
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
    });
  }
  
  onSidebarNewChat(): void {
    // Close sidenav on mobile when new chat is clicked from sidebar
    if (this.isMobileView && this.sidenav) {
      this.sidenav.close();
    }
  }
  
  onThreadSelected(threadId: string): void {
    // Close sidenav on mobile when thread is selected
    if (this.isMobileView && this.sidenav) {
      this.sidenav.close();
    }
  }

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  onChatInputRef(component: ChatInputComponent): void {
    this.chatInputRef = component;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        // Use smooth scroll behavior for better UX
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch (err) {
      // Fallback to instant scroll if smooth scroll fails
      try {
        if (this.messagesContainer) {
          const element = this.messagesContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      } catch (fallbackErr) {
        console.error('Scroll to bottom failed:', fallbackErr);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth < this.MOBILE_BREAKPOINT;
    
    // If we switched from mobile to desktop, ensure sidenav is open
    if (wasMobile && !this.isMobileView && this.sidenav) {
      this.sidenav.open();
      this.sidenavOpened = true;
    }
    
    // If we switched from desktop to mobile, close sidenav
    if (!wasMobile && this.isMobileView && this.sidenav) {
      this.sidenav.close();
      this.sidenavOpened = false;
    }
    
    // Update body scroll lock
    this.updateBodyScrollLock();
  }

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
      this.sidenavOpened = !this.sidenavOpened;
      this.updateBodyScrollLock();
    }
  }

  onSidenavClosed(): void {
    this.sidenavOpened = false;
    this.updateBodyScrollLock();
  }

  private updateBodyScrollLock(): void {
    if (this.isMobileView && this.sidenavOpened) {
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }
}
