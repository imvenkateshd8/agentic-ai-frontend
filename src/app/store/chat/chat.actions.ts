import { createAction, props } from '@ngrx/store';
import { Message, Thread, ToolStatus, StreamChunk } from '../../core/models/chat.models';

// Thread Actions
export const loadThreads = createAction('[Chat] Load Threads');

export const loadThreadsSuccess = createAction(
  '[Chat] Load Threads Success',
  props<{ threads: Thread[] }>()
);

export const loadThreadsFailure = createAction(
  '[Chat] Load Threads Failure',
  props<{ error: string }>()
);

export const createNewThread = createAction('[Chat] Create New Thread');

export const createNewThreadSuccess = createAction(
  '[Chat] Create New Thread Success',
  props<{ thread: Thread }>()
);

export const setCurrentThread = createAction(
  '[Chat] Set Current Thread',
  props<{ threadId: string }>()
);

// Message Actions
export const loadMessages = createAction(
  '[Chat] Load Messages',
  props<{ threadId: string }>()
);

export const loadMessagesSuccess = createAction(
  '[Chat] Load Messages Success',
  props<{ threadId: string; messages: Message[] }>()
);

export const loadAllMessagesSuccess = createAction(
  '[Chat] Load All Messages Success',
  props<{ messages: { [threadId: string]: Message[] } }>()
);

export const loadMessagesFailure = createAction(
  '[Chat] Load Messages Failure',
  props<{ error: string }>()
);

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ content: string; threadId: string; attachedDocument?: string }>()
);

export const sendMessageSuccess = createAction(
  '[Chat] Send Message Success',
  props<{ message: Message }>()
);

export const sendMessageFailure = createAction(
  '[Chat] Send Message Failure',
  props<{ error: string }>()
);

// Streaming Actions
export const startStreaming = createAction('[Chat] Start Streaming');

export const streamChunk = createAction(
  '[Chat] Stream Chunk',
  props<{ chunk: StreamChunk; threadId: string }>()
);

export const streamComplete = createAction(
  '[Chat] Stream Complete',
  props<{ message: Message }>()
);

export const streamError = createAction(
  '[Chat] Stream Error',
  props<{ error: string }>()
);

// Tool Status Actions
export const updateToolStatus = createAction(
  '[Chat] Update Tool Status',
  props<{ toolStatus: ToolStatus }>()
);

export const clearToolStatus = createAction('[Chat] Clear Tool Status');

// Clear Actions
export const clearCurrentChat = createAction('[Chat] Clear Current Chat');
