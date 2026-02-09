import { DocumentSummary } from '../../core/models/document.models';

/**
 * Document state for PDF uploads and management
 */
export interface DocumentState {
  documents: { [threadId: string]: { [filename: string]: DocumentSummary } };
  currentUpload: DocumentSummary | null;
  isUploading: boolean;
  error: string | null;
}

export const initialDocumentState: DocumentState = {
  documents: {},
  currentUpload: null,
  isUploading: false,
  error: null
};
