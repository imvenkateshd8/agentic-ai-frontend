import { createReducer, on } from '@ngrx/store';
import { initialChatState } from './chat.state';
import * as ChatActions from './chat.actions';
import { MessageRole } from '../../core/models/chat.models';

export const chatReducer = createReducer(
  initialChatState,

  // Threads
  on(ChatActions.loadThreads, (state) => ({
    ...state,
    isLoading: true
  })),

  on(ChatActions.loadThreadsSuccess, (state, { threads }) => ({
    ...state,
    threads,
    isLoading: false
  })),

  on(ChatActions.loadThreadsFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false
  })),

  on(ChatActions.createNewThreadSuccess, (state, { thread }) => {
    // Save new thread as current in localStorage
    localStorage.setItem('currentThreadId', thread.id);
    return {
      ...state,
      threads: [thread, ...state.threads],
      currentThreadId: thread.id,
      messages: {
        ...state.messages,
        [thread.id]: []
      }
    };
  }),

  on(ChatActions.setCurrentThread, (state, { threadId }) => {
    // Save to localStorage for persistence
    localStorage.setItem('currentThreadId', threadId);
    return {
      ...state,
      currentThreadId: threadId
    };
  }),

  // Messages
  on(ChatActions.loadMessagesSuccess, (state, { threadId, messages }) => ({
    ...state,
    messages: {
      ...state.messages,
      [threadId]: messages
    }
  })),

  on(ChatActions.loadAllMessagesSuccess, (state, { messages }) => {
    // Restore current thread from localStorage
    const savedThreadId = localStorage.getItem('currentThreadId');
    return {
      ...state,
      messages,
      currentThreadId: savedThreadId,
      isLoading: false
    };
  }),

  on(ChatActions.sendMessage, (state, { content, threadId, attachedDocument }) => {
    // Immediately add user message to UI
    const userMessage = {
      id: Date.now().toString(),
      threadId,
      role: MessageRole.USER,
      content,
      timestamp: new Date(),
      attachedDocument
    };
    const threadMessages = state.messages[threadId] || [];
    
    // Auto-name thread from first message (first 100 chars)
    const threads = state.threads.map(thread => {
      if (thread.id === threadId && thread.title === 'New Conversation' && threadMessages.length === 0) {
        const updatedThread = {
          ...thread,
          title: content.substring(0, 100),
          updatedAt: new Date()
        };
        
        // Save to localStorage
        const storedThreads = localStorage.getItem('chat_threads');
        if (storedThreads) {
          const allThreads = JSON.parse(storedThreads);
          const index = allThreads.findIndex((t: any) => t.id === threadId);
          if (index !== -1) {
            allThreads[index] = updatedThread;
            localStorage.setItem('chat_threads', JSON.stringify(allThreads));
          }
        }
        
        return updatedThread;
      }
      return thread;
    });
    
    return {
      ...state,
      threads,
      isWaitingForResponse: true,
      messages: {
        ...state.messages,
        [threadId]: [...threadMessages, userMessage]
      }
    };
  }),

  on(ChatActions.sendMessageSuccess, (state, { message }) => {
    // This handles the assistant response
    const threadMessages = state.messages[message.threadId] || [];
    return {
      ...state,
      isWaitingForResponse: false,
      messages: {
        ...state.messages,
        [message.threadId]: [...threadMessages, message]
      }
    };
  }),

  on(ChatActions.sendMessageFailure, (state) => ({
    ...state,
    isWaitingForResponse: false
  })),

  // Streaming
  on(ChatActions.startStreaming, (state) => ({
    ...state,
    isStreaming: true
  })),

  on(ChatActions.streamChunk, (state, { chunk, threadId }) => {
    const threadMessages = state.messages[threadId] || [];
    const lastMessage = threadMessages[threadMessages.length - 1];

    // If last message is AI and streaming, append to it
    if (lastMessage && lastMessage.role === MessageRole.ASSISTANT && lastMessage.metadata?.isStreaming) {
      const updatedMessages = threadMessages.slice(0, -1);
      return {
        ...state,
        messages: {
          ...state.messages,
          [threadId]: [
            ...updatedMessages,
            {
              ...lastMessage,
              content: lastMessage.content + chunk.content
            }
          ]
        }
      };
    }

    // Create new streaming message
    const newMessage = {
      id: Date.now().toString(),
      threadId,
      role: MessageRole.ASSISTANT,
      content: chunk.content,
      timestamp: new Date(),
      metadata: { isStreaming: true }
    };

    return {
      ...state,
      messages: {
        ...state.messages,
        [threadId]: [...threadMessages, newMessage]
      }
    };
  }),

  on(ChatActions.streamComplete, (state, { message }) => {
    const threadMessages = state.messages[message.threadId] || [];
    const withoutStreaming = threadMessages.filter(m => !m.metadata?.isStreaming);
    
    return {
      ...state,
      messages: {
        ...state.messages,
        [message.threadId]: [...withoutStreaming, message]
      },
      isStreaming: false
    };
  }),

  on(ChatActions.streamError, (state, { error }) => ({
    ...state,
    error,
    isStreaming: false
  })),

  // Tool Status
  on(ChatActions.updateToolStatus, (state, { toolStatus }) => ({
    ...state,
    toolStatus
  })),

  on(ChatActions.clearToolStatus, (state) => ({
    ...state,
    toolStatus: null
  })),

  // Clear
  on(ChatActions.clearCurrentChat, (state) => ({
    ...state,
    currentThreadId: null
  }))
);
