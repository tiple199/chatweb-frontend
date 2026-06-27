export interface Conversation {
  ConversationId: string;
  ChatName: string;
  IsGroupChat: boolean;
  GroupAdminId?: string; // Nullable cho chat 1-1
  LatestMessageId?: string;
  CreateAt: string;
  UpdatedAt: string;
  IsActive: boolean;
  OtherUserId?: string;
  OtherUserAvatar?: string | null;
}

export interface ConversationParticipant {
  ConversationId?: string;
  UserId?: string; 
  userId?: string;
  fullName?: string;
  avatar?: string | null;
  JoinedAt?: string;
  Role?: string;
  role?: string;
  IsActive?: boolean;
  LeftAt?: string;
  RemoveBy?: string; // Người thực hiện xóa
}
