/**
 * Core chat models and interfaces
 * Based on LangGraph streaming architecture
 */

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

export enum MessageType {
  HUMAN = 'HumanMessage',
  AI = 'AIMessage',
  TOOL = 'ToolMessage'
}

export interface Message {
  id: string;
  threadId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
  attachedDocument?: string;
}

export interface MessageMetadata {
  toolName?: string;
  toolStatus?: 'running' | 'complete' | 'error';
  chunks?: number;
  isStreaming?: boolean;
  sources?: Source[];
}

export interface Source {
  type: string;
  name: string;
}

export interface Thread {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  documentMetadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  filename: string;
  chunks: number;
  documents: number;
  uploadedAt: Date;
}

export interface StreamChunk {
  type: MessageType;
  content: string;
  metadata?: any;
  name?: string; // For tool messages
}

export interface ToolStatus {
  name: string;
  status: 'running' | 'complete' | 'error';
  message: string;
}

export interface ChatConfig {
  threadId: string;
  metadata?: {
    threadId: string;
    [key: string]: any;
  };
  runName?: string;
}

export interface ChatRequest {
  message: string;
  thread_id: string;
}

export interface ChatResponse {
  thread_id: string;
  answer: string;
  sources: Source[];
}
