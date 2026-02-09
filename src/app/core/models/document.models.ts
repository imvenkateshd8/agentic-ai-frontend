/**
 * Document upload and management models
 */

export interface DocumentUpload {
  file: File;
  threadId: string;
}

export interface DocumentSummary {
  filename: string;
  chunks: number;
  documents: number;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

export interface IngestRequest {
  fileData: ArrayBuffer;
  threadId: string;
  filename: string;
}

export interface IngestResponse {
  thread_id: string;
  filename: string;
  documents: number;
  chunks: number;
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error'
}
