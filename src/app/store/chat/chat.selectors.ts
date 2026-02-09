import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from './chat.state';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectCurrentThreadId = createSelector(
  selectChatState,
  (state) => state.currentThreadId
);

export const selectThreads = createSelector(
  selectChatState,
  (state) => state.threads
);

export const selectCurrentThread = createSelector(
  selectChatState,
  (state) => {
    if (!state.currentThreadId) return null;
    return state.threads.find(t => t.id === state.currentThreadId) || null;
  }
);

export const selectAllMessages = createSelector(
  selectChatState,
  (state) => state.messages
);

export const selectCurrentMessages = createSelector(
  selectChatState,
  (state) => {
    if (!state.currentThreadId) return [];
    return state.messages[state.currentThreadId] || [];
  }
);

export const selectIsStreaming = createSelector(
  selectChatState,
  (state) => state.isStreaming
);

export const selectIsWaitingForResponse = createSelector(
  selectChatState,
  (state) => state.isWaitingForResponse
);

export const selectToolStatus = createSelector(
  selectChatState,
  (state) => state.toolStatus
);

export const selectChatLoading = createSelector(
  selectChatState,
  (state) => state.isLoading
);

export const selectChatError = createSelector(
  selectChatState,
  (state) => state.error
);
