import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import * as DocumentActions from '../../../store/document/document.actions';
import { selectDocumentUploadProgress } from '../../../store/document/document.selectors';

export interface DocumentUploadData {
  threadId: string;
}

@Component({
  selector: 'app-document-upload-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>upload_file</mat-icon>
      Upload Document
    </h2>
    
    <mat-dialog-content>
      <div class="upload-zone" *ngIf="!selectedFile && !isUploading">
        <input
          type="file"
          #fileInput
          accept=".pdf"
          (change)="onFileSelected($event)"
          style="display: none;"
        />
        
        <div class="upload-prompt" (click)="fileInput.click()">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="prompt-text">Click to select a PDF document</p>
          <p class="prompt-hint">or drag and drop here</p>
        </div>
      </div>
      
      <div class="upload-progress" *ngIf="selectedFile && !uploadComplete">
        <div class="file-info">
          <mat-icon>description</mat-icon>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        
        <div class="progress-section" *ngIf="isUploading">
          <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
          <p class="progress-text">{{ uploadStatus }}</p>
        </div>
      </div>
      
      <div class="upload-success" *ngIf="uploadComplete">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <p class="success-text">Document uploaded successfully!</p>
        <div class="document-stats" *ngIf="uploadResult">
          <p><strong>Filename:</strong> {{ uploadResult.filename }}</p>
          <p><strong>Chunks:</strong> {{ uploadResult.chunks }}</p>
          <p><strong>Documents:</strong> {{ uploadResult.documents }}</p>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="isUploading">
        Cancel
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onUpload()"
        [disabled]="!selectedFile || isUploading || uploadComplete"
        *ngIf="!uploadComplete"
      >
        Upload
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onAttach()"
        *ngIf="uploadComplete"
      >
        Attach to Message
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .upload-zone {
      min-height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .upload-prompt {
      text-align: center;
      padding: 3rem;
      border: 2px dashed #cbd5e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
      
      &:hover {
        border-color: #667eea;
        background-color: #f7fafc;
      }
    }
    
    .upload-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #667eea;
      margin-bottom: 1rem;
    }
    
    .prompt-text {
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
      margin: 0 0 0.5rem;
    }
    
    .prompt-hint {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }
    
    .upload-progress {
      padding: 1.5rem;
    }
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #667eea;
      }
    }
    
    .file-details {
      flex: 1;
      
      .file-name {
        font-weight: 500;
        color: #2d3748;
        margin: 0 0 0.25rem;
      }
      
      .file-size {
        font-size: 14px;
        color: #718096;
        margin: 0;
      }
    }
    
    .progress-section {
      margin-top: 1rem;
      
      .progress-text {
        margin-top: 0.5rem;
        font-size: 14px;
        color: #4a5568;
        text-align: center;
      }
    }
    
    .upload-success {
      text-align: center;
      padding: 2rem;
      
      .success-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #48bb78;
        margin-bottom: 1rem;
      }
      
      .success-text {
        font-size: 18px;
        font-weight: 500;
        color: #2d3748;
        margin-bottom: 1.5rem;
      }
    }
    
    .document-stats {
      background-color: #f7fafc;
      padding: 1rem;
      border-radius: 8px;
      text-align: left;
      
      p {
        margin: 0.5rem 0;
        font-size: 14px;
        color: #4a5568;
      }
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      mat-icon {
        color: #667eea;
      }
    }
  `]
})
export class DocumentUploadModalComponent implements OnDestroy {
  selectedFile: File | null = null;
  isUploading = false;
  uploadComplete = false;
  uploadStatus = 'Uploading document...';
  uploadResult: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<DocumentUploadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentUploadData,
    private store: Store
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
      }
    }
  }

  onUpload(): void {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    this.uploadStatus = 'Uploading document...';
    
    // Dispatch upload action
    this.store.dispatch(DocumentActions.uploadDocument({
      upload: {
        file: this.selectedFile,
        threadId: this.data.threadId
      }
    }));
    
    // Subscribe to upload completion with proper cleanup
    this.store.select(selectDocumentUploadProgress).pipe(
      takeUntil(this.destroy$),
      filter(progress => progress !== null)
    ).subscribe(progress => {
      if (progress!.status === 'complete') {
        this.uploadStatus = 'Processing and indexing...';
        setTimeout(() => {
          this.isUploading = false;
          this.uploadComplete = true;
          this.uploadResult = progress;
        }, 500);
      } else if (progress!.status === 'processing') {
        this.uploadStatus = 'Processing document...';
      }
    });
  }

  onAttach(): void {
    if (this.uploadResult) {
      // Clear currentUpload in store
      this.store.dispatch(DocumentActions.clearCurrentUpload());
      
      this.dialogRef.close({
        attached: true,
        filename: this.uploadResult.filename,
        threadId: this.data.threadId
      });
    }
  }

  onCancel(): void {
    // Clear currentUpload in store
    this.store.dispatch(DocumentActions.clearCurrentUpload());
    this.dialogRef.close({ attached: false });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
