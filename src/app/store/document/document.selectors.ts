import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DocumentState } from './document.state';

export const selectDocumentState = createFeatureSelector<DocumentState>('document');

export const selectAllDocuments = createSelector(
  selectDocumentState,
  (state) => state.documents
);

export const selectThreadDocuments = (threadId: string) =>
  createSelector(selectDocumentState, (state) => state.documents[threadId] || {});

export const selectCurrentUpload = createSelector(
  selectDocumentState,
  (state) => state.currentUpload
);

export const selectIsUploading = createSelector(
  selectDocumentState,
  (state) => state.isUploading
);

export const selectDocumentError = createSelector(
  selectDocumentState,
  (state) => state.error
);

export const selectLatestDocument = (threadId: string) =>
  createSelector(selectDocumentState, (state) => {
    const docs = state.documents[threadId];
    if (!docs) return null;
    const docArray = Object.values(docs);
    return docArray[docArray.length - 1] || null;
  });

export const selectDocumentUploadProgress = createSelector(
  selectDocumentState,
  (state) => state.currentUpload
);
