import type { Message } from '../types/message.type';

export type BackendSender = {
  _id?: string;
  fullName?: string;
  avatar?: string | null;
};

export type BackendMessage = {
  _id?: string;
  conversationId?: string;
  senderId?: string | BackendSender;
  content?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  replyToMessageId?: string;
  isDeletedBySender?: boolean;
  isDeletedForAll?: boolean;
  deletedAt?: string;
};

const getSenderId = (sender: BackendMessage['senderId']) => {
  if (typeof sender === 'string') return sender;
  return sender?._id || '';
};

export const mapBackendMessage = (message: BackendMessage): Message => ({
  MessageId: message._id || '',
  ConversationId: message.conversationId || '',
  SenderId: getSenderId(message.senderId),
  MessageType: message.type || 'text',
  Content: message.content || '',
  FileName: message.fileName,
  FileSize: message.fileSize,
  MimeType: message.mimeType,
  CreatedAt: message.createdAt || new Date().toISOString(),
  UpdatedAt: message.updatedAt || new Date().toISOString(),
  ReplyToMessageId: message.replyToMessageId,
  IsDeletedBySender: message.isDeletedBySender ?? false,
  IsDeletedForAll: message.isDeletedForAll ?? false,
  DeletedAt: message.deletedAt,
});

export const mapBackendMessages = (messages: BackendMessage[] = []): Message[] =>
  messages.map(mapBackendMessage);