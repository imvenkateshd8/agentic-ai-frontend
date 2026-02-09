import { createReducer, on } from '@ngrx/store';
import { initialDocumentState } from './document.state';
import * as DocumentActions from './document.actions';

export const documentReducer = createReducer(
  initialDocumentState,

  on(DocumentActions.uploadDocument, (state) => ({
    ...state,
    isUploading: true,
    error: null
  })),

  on(DocumentActions.uploadDocumentProgress, (state, { summary }) => ({
    ...state,
    currentUpload: summary
  })),

  on(DocumentActions.uploadDocumentSuccess, (state, { threadId, filename, summary }) => ({
    ...state,
    documents: {
      ...state.documents,
      [threadId]: {
        ...(state.documents[threadId] || {}),
        [filename]: summary
      }
    },
    currentUpload: summary, // Keep summary to allow modal to detect completion
    isUploading: false,
    error: null
  })),

  on(DocumentActions.uploadDocumentFailure, (state, { error }) => ({
    ...state,
    currentUpload: null,
    isUploading: false,
    error
  })),

  on(DocumentActions.loadThreadDocumentsSuccess, (state, { threadId, documents }) => ({
    ...state,
    documents: {
      ...state.documents,
      [threadId]: documents
    }
  })),

  on(DocumentActions.clearCurrentUpload, (state) => ({
    ...state,
    currentUpload: null
  }))
);
