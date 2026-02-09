import { createAction, props } from '@ngrx/store';
import { DocumentSummary, DocumentUpload, IngestResponse } from '../../core/models/document.models';

export const uploadDocument = createAction(
  '[Document] Upload Document',
  props<{ upload: DocumentUpload }>()
);

export const uploadDocumentProgress = createAction(
  '[Document] Upload Document Progress',
  props<{ summary: DocumentSummary }>()
);

export const uploadDocumentSuccess = createAction(
  '[Document] Upload Document Success',
  props<{ threadId: string; filename: string; summary: DocumentSummary }>()
);

export const uploadDocumentFailure = createAction(
  '[Document] Upload Document Failure',
  props<{ error: string }>()
);

export const loadThreadDocuments = createAction(
  '[Document] Load Thread Documents',
  props<{ threadId: string }>()
);

export const loadThreadDocumentsSuccess = createAction(
  '[Document] Load Thread Documents Success',
  props<{ threadId: string; documents: { [filename: string]: DocumentSummary } }>()
);

export const clearCurrentUpload = createAction(
  '[Document] Clear Current Upload'
);
