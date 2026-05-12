export interface Conversation {
  ConversationId: string;
  ChatName: string;
  IsGroupChat: boolean;
  GroupAdminId?: string; // Nullable cho chat 1-1
  LatestMessageId?: string;
  CreateAt: string;
  UpdatedAt: string;
  IsActive: boolean;
}

export interface ConversationParticipant {
  ConversationId: string;
  UserId: string;
  JoinedAt: string;
  Role: string; // enum (vd: 'admin', 'member')
  IsActive: boolean;
  LeftAt?: string;
  RemoveBy?: string; // Người thực hiện xóa
}