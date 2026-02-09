import { AuthState } from './auth/auth.state';
import { ChatState } from './chat/chat.state';
import { DocumentState } from './document/document.state';

/**
 * Root application state
 */
export interface AppState {
  auth: AuthState;
  chat: ChatState;
  document: DocumentState;
}
