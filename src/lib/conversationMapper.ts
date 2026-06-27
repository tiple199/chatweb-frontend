import type { Conversation } from '../types/conversation.type';

export interface BackendConversation {
  conversationId: string;
  chatName: string;
  isGroupChat: boolean;
  groupAdmins?: string[];
  latestMessage?: any;
  createdAt: string;
  updatedAt: string;
  otherUserAvatar?: string | null;
  otherUserId?: string; // Sẽ được thêm ở backend
}

export const mapBackendConversation = (be: BackendConversation): Conversation => {
  return {
    ConversationId: be.conversationId || (be as any).ConversationId,
    ChatName: be.chatName || (be as any).ChatName || 'Không xác định',
    IsGroupChat: be.isGroupChat ?? (be as any).IsGroupChat ?? false,
    GroupAdminId: be.groupAdmins?.[0] || (be as any).GroupAdminId,
    LatestMessageId: be.latestMessage?._id || (be as any).LatestMessageId,
    CreateAt: be.createdAt || (be as any).CreateAt,
    UpdatedAt: be.updatedAt || (be as any).UpdatedAt,
    IsActive: true,
    OtherUserId: be.otherUserId || (be as any).OtherUserId,
    OtherUserAvatar: be.otherUserAvatar || (be as any).OtherUserAvatar || null
  };
};

export const mapBackendConversations = (beArray: BackendConversation[]): Conversation[] => {
  if (!Array.isArray(beArray)) return [];
  return beArray.map(mapBackendConversation);
};
