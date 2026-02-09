import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  DocumentSummary,
  IngestRequest,
  IngestResponse
} from '../models/document.models';
import { environment } from '../../../environments/environment';
import * as DocumentActions from '../../store/document/document.actions';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  /**
   * Upload and ingest a PDF document using form-data
   */
  uploadAndIngest(file: File, threadId: string): Observable<IngestResponse> {
    // Dispatch progress action
    this.store.dispatch(
      DocumentActions.uploadDocumentProgress({
        summary: {
          filename: file.name,
          chunks: 0,
          documents: 0,
          uploadedAt: new Date(),
          status: 'processing'
        }
      })
    );

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Send to backend with thread_id as query parameter
    return this.http.post<IngestResponse>(
      `${this.API_URL}/upload-pdf?thread_id=${threadId}`,
      formData
    );
  }

  /**
   * Get documents for a specific thread (managed locally)
   */
  getThreadDocuments(
    threadId: string
  ): Observable<{ [filename: string]: DocumentSummary }> {
    const storedDocs = localStorage.getItem(`documents_${threadId}`);
    const docs = storedDocs ? JSON.parse(storedDocs) : {};
    return new Observable(observer => {
      observer.next(docs);
      observer.complete();
    });
  }

  /**
   * Save document metadata locally
   */
  saveDocumentMetadata(threadId: string, summary: DocumentSummary): void {
    const storedDocs = localStorage.getItem(`documents_${threadId}`);
    const docs = storedDocs ? JSON.parse(storedDocs) : {};
    docs[summary.filename] = summary;
    localStorage.setItem(`documents_${threadId}`, JSON.stringify(docs));
  }
}
