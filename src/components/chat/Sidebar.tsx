import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { conversationApi } from '../../api/conversation.api';
import type { Conversation } from '../../types/conversation.type';
import { useAuthStore } from '../../store/auth.store';
import { SearchUser } from './SearchUser';
import { CreateGroupModal } from './modals/CreateGroupModal';
import { FriendRequestsModal } from './modals/FriendRequestsModal';
import { friendApi } from '../../api/friend.api';
import { authApi } from '../../api/auth.api';
import type { User } from '../../types/user.type';
import { mapBackendConversations } from '../../lib/conversationMapper';
import { useSocket } from '../../hooks/useSocket';

interface SidebarProps {
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onSelectStranger?: (user: User) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeConversationId, onSelectConversation, onSelectStranger }) => {
  const { user, logout } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string>('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isFriendRequestsOpen, setIsFriendRequestsOpen] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);
  
  // States cho thư mục người lạ
  const [friends, setFriends] = useState<User[]>([]);
  const [isStrangerFolderOpen, setIsStrangerFolderOpen] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await conversationApi.getConversations();
      const rawData = (res.data as any).data || res.data || [];
      setConversations(mapBackendConversations(rawData));
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          // Ignore invalid token error for frontend mock testing
          setConversations([]);
        } else {
          setError(err.response?.data?.message || 'Không thể tải danh sách chat');
        }
      }
    }
  };

  const { socket, onEvent } = useSocket();

  const fetchFriendRequests = async () => {
    try {
      const reqs = await friendApi.getFriendRequests();
      setRequestsCount(reqs.length);
      
      const friendList = await friendApi.getFriends();
      setFriends(friendList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') || ''; 
    try {
      if (refreshToken) { 
        await authApi.logout({ refreshToken });
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("Lỗi gọi API đăng xuất:", err.response?.data?.message || (err as Error).message);
      }
    } finally {
      logout(); 
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const cleanupFriendRequest = onEvent('friend_request', async () => {
      await fetchFriendRequests();
    });

    const cleanupFriendAccepted = onEvent('friend_accepted', async () => {
      await fetchFriendRequests();
      await fetchConversations();
    });

    const cleanupFriendDeclined = onEvent('friend_declined', async () => {
      await fetchFriendRequests();
    });

    return () => {
      cleanupFriendRequest();
      cleanupFriendAccepted();
      cleanupFriendDeclined();
    };
  }, [socket, onEvent]);

  return (
    <div className="w-full md:w-[340px] border-r border-slate-200 bg-white flex flex-col h-full shrink-0 shadow-sm z-20">
      {/* Profile Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 backdrop-blur-sm">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md border border-white">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate">{user?.fullName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-xs text-slate-500 font-medium">Trực tuyến</span>
          </div>
        </div>
        <button 
          onClick={() => setIsFriendRequestsOpen(true)}
          className="relative p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 rounded-full transition-colors"
          title="Lời mời kết bạn"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {requestsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
              {requestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Action Bar (Search & Create Group) */}
      <div className="p-3 border-b border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tin nhắn</h2>
          <button 
            onClick={() => setIsCreateGroupOpen(true)}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Tạo nhóm
          </button>
        </div>
        <SearchUser onSelectUser={(user) => {
          if (onSelectStranger) onSelectStranger(user);
        }} />
      </div>
      
      {/* List Header & Stranger View Toggle */}
      {isStrangerFolderOpen && (
        <div className="px-4 py-2 border-b border-slate-100 bg-blue-50/50 flex items-center gap-2">
          <button 
            onClick={() => setIsStrangerFolderOpen(false)}
            className="p-1 -ml-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-all flex items-center justify-center relative"
            title="Quay lại danh sách chính"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {/* Chấm đỏ nếu có tin mới bên ngoài (demo UI) */}
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-blue-50"></span>
          </button>
          <span className="text-sm font-bold text-slate-700">Tin nhắn người lạ</span>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {error && <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs text-center border border-red-100">{error}</div>}
        
        
        {(() => {
          const friendIds = new Set(friends.map(f => f._id));
          
          // Lọc trùng lặp conversation (chỉ lấy 1 conversation duy nhất cho mỗi OtherUserId, giữ nguyên group chat)
          const deduplicateConversations = (convs: Conversation[]) => {
            const seenUsers = new Set<string>();
            return convs.filter(c => {
              if (c.IsGroupChat) return true;
              
              // Sử dụng OtherUserId hoặc đánh dấu là 'self' nếu OtherUserId bị null (người dùng tự chat với chính mình)
              const dedupKey = c.OtherUserId || 'self';
              
              if (seenUsers.has(dedupKey)) return false;
              seenUsers.add(dedupKey);
              return true;
            });
          };

          const strangerConversations = deduplicateConversations(conversations.filter(
            c => !c.IsGroupChat && c.OtherUserId && !friendIds.has(c.OtherUserId)
          ));
          
          const normalConversations = deduplicateConversations(conversations.filter(
            c => c.IsGroupChat || !c.OtherUserId || friendIds.has(c.OtherUserId)
          ));

          const listToRender = isStrangerFolderOpen ? strangerConversations : normalConversations;

          if (listToRender.length === 0 && !error) {
            return (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">Chưa có cuộc trò chuyện nào</p>
                <p className="text-slate-400 text-xs mt-1">Hãy tìm kiếm hoặc tạo nhóm để bắt đầu</p>
              </div>
            );
          }

          return (
            <ul className="p-2 space-y-1">
              {!isStrangerFolderOpen && strangerConversations.length > 0 && (
                <li 
                  onClick={() => setIsStrangerFolderOpen(true)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:bg-orange-50/50 mb-2 group"
                >
                  <div className="relative w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-orange-100 text-orange-500 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate text-orange-700">Tin nhắn người lạ</h4>
                    <p className="text-xs truncate text-orange-500/80">
                      {strangerConversations.length} cuộc trò chuyện
                    </p>
                  </div>
                </li>
              )}

              {listToRender.map((conv) => (
                <li 
                  key={conv.ConversationId}
                  onClick={() => onSelectConversation(conv.ConversationId)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                    activeConversationId === conv.ConversationId 
                    ? 'bg-blue-50/80 border-blue-100 shadow-[0_2px_10px_-4px_rgba(59,130,246,0.3)]' 
                    : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`relative w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    conv.IsGroupChat 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                  }`}>
                    {(conv.ChatName || '?').charAt(0).toUpperCase()}
                    {conv.IsGroupChat && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <div className="bg-purple-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`font-semibold text-sm truncate ${activeConversationId === conv.ConversationId ? 'text-blue-700' : 'text-slate-800'}`}>
                        {conv.ChatName}
                      </h4>
                    </div>
                    <p className={`text-xs truncate ${activeConversationId === conv.ConversationId ? 'text-blue-500' : 'text-slate-500'}`}>
                      Nhấn để xem tin nhắn...
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
        <button 
          onClick={handleLogout} 
          className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Đăng xuất
        </button>
      </div>

      {isCreateGroupOpen && (
        <CreateGroupModal 
          onClose={() => setIsCreateGroupOpen(false)} 
          onSuccess={() => {
            setIsCreateGroupOpen(false);
            fetchConversations();
          }} 
        />
      )}
      
      {isFriendRequestsOpen && (
        <FriendRequestsModal 
          onClose={() => {
            setIsFriendRequestsOpen(false);
            fetchFriendRequests(); // Refresh số lượng
          }} 
        />
      )}
    </div>
  );
};