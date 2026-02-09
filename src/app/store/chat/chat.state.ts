import { Message, Thread, ToolStatus } from '../../core/models/chat.models';

/**
 * Chat state
 */
export interface ChatState {
  currentThreadId: string | null;
  threads: Thread[];
  messages: { [threadId: string]: Message[] };
  isStreaming: boolean;
  toolStatus: ToolStatus | null;
  isLoading: boolean;
  isWaitingForResponse: boolean;
  error: string | null;
}

export const initialChatState: ChatState = {
  currentThreadId: null,
  threads: [],
  messages: {},
  isStreaming: false,
  toolStatus: null,
  isLoading: false,
  isWaitingForResponse: false,
  error: null
};
