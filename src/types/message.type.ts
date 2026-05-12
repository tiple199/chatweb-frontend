export interface Message {
  MessageId: string;
  ConversationId: string;
  SenderId: string;
  MessageType: string; // 'text', 'image', 'file'
  Content: string;
  FileName?: string;
  FileSize?: number;
  MimeType?: string;
  CreatedAt: string;
  UpdatedAt: string;
  ReplyToMessageId?: string;
  IsDeletedBySender: boolean;
  IsDeletedForAll: boolean;
  DeletedAt?: string;
}

export interface MessageRead {
  MessageId: string;
  UserId: string;
  ReadAt: string;
}