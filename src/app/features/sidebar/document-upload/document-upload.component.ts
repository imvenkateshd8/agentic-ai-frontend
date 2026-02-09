import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DocumentSummary } from '../../../core/models/document.models';
import * as DocumentActions from '../../../store/document/document.actions';
import {
  selectCurrentUpload,
  selectIsUploading,
  selectLatestDocument
} from '../../../store/document/document.selectors';
import { selectCurrentThreadId } from '../../../store/chat/chat.selectors';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit {
  isUploading$: Observable<boolean>;
  currentUpload$: Observable<DocumentSummary | null>;
  currentThreadId$: Observable<string | null>;
  latestDocument$: Observable<DocumentSummary | null> | undefined;

  constructor(private store: Store) {
    this.isUploading$ = this.store.select(selectIsUploading);
    this.currentUpload$ = this.store.select(selectCurrentUpload);
    this.currentThreadId$ = this.store.select(selectCurrentThreadId);
  }

  ngOnInit(): void {
    this.currentThreadId$.subscribe((threadId) => {
      if (threadId) {
        this.latestDocument$ = this.store.select(selectLatestDocument(threadId));
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      let threadId: string;
      this.currentThreadId$.subscribe((id) => {
        if (id) {
          threadId = id;
          this.store.dispatch(
            DocumentActions.uploadDocument({
              upload: { file, threadId }
            })
          );
        }
      });

      // Reset input
      input.value = '';
    }
  }
}
