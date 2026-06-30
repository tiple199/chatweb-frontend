import React, { useEffect, useState, useRef } from 'react';
import { AxiosError } from 'axios';
import { conversationApi } from '../../api/conversation.api';
import type { Conversation } from '../../types/conversation.type';
import { useAuthStore } from '../../store/auth.store';
import { SearchUser } from './SearchUser';
import { CreateGroupModal } from './models/CreateGroupModal';
import { FriendRequestsModal } from './models/FriendRequestsModal';
import { friendApi } from '../../api/friend.api';
import { authApi } from '../../api/auth.api';
import { userApi } from '../../api/user.api';
import type { User } from '../../types/user.type';
import { mapBackendConversations } from '../../lib/conversationMapper';
import { useSocket } from '../../hooks/useSocket';
import { ChatAvatar } from '../ChatAvatar';
import { notification, Modal } from 'antd';

interface SidebarProps {
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onSelectStranger?: (user: User) => void;
  onConversationDeleted?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeConversationId, onSelectConversation, onSelectStranger, onConversationDeleted }) => {
  const { user, logout, updateUser } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isFriendRequestsOpen, setIsFriendRequestsOpen] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);

  const [friends, setFriends] = useState<User[]>([]);
  const [isStrangerFolderOpen, setIsStrangerFolderOpen] = useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openConversationMenuId, setOpenConversationMenuId] = useState<string | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const conversationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (conversationMenuRef.current && !conversationMenuRef.current.contains(event.target as Node)) {
        setOpenConversationMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await conversationApi.getConversations();
      const rawData = (res.data as any).data || res.data || [];
      setConversations(mapBackendConversations(rawData));
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
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

  const handleLogout = () => {
    Modal.confirm({
      title: 'Đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất không?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
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
      }
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      notification.error({ message: 'Lỗi', description: 'Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await userApi.updateAvatar(file);
      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
        notification.success({ message: 'Thành công', description: 'Cập nhật ảnh đại diện thành công!' });
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        notification.error({ message: 'Lỗi', description: err.response?.data?.message || 'Lỗi khi cập nhật ảnh đại diện' });
      } else {
        notification.error({ message: 'Lỗi hệ thống', description: 'Đã xảy ra lỗi không xác định' });
      }
    } finally {
      setIsUploadingAvatar(false);
      setIsProfileMenuOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    Modal.confirm({
      title: 'Xóa đoạn chat',
      content: `Bạn có chắc chắn muốn xóa đoạn chat "${conversation.ChatName}" khỏi danh sách? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingConversationId(conversation.ConversationId);
        setOpenConversationMenuId(null);

        try {
          await conversationApi.deleteConversation(conversation.ConversationId);
          setConversations((prev) => prev.filter((conv) => conv.ConversationId !== conversation.ConversationId));
          onConversationDeleted?.(conversation.ConversationId);
          notification.success({ message: 'Thành công', description: 'Đã xóa đoạn chat' });
        } catch (err: unknown) {
          if (err instanceof AxiosError) {
            notification.error({ message: 'Lỗi', description: err.response?.data?.message || 'Không thể xóa đoạn chat này' });
          } else {
            notification.error({ message: 'Lỗi', description: 'Không thể xóa đoạn chat này' });
          }
        } finally {
          setDeletingConversationId(null);
        }
      }
    });
  };

  useEffect(() => {
    fetchConversations();
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchConversations();
    };
    window.addEventListener('refresh_conversations', handleRefresh);
    return () => window.removeEventListener('refresh_conversations', handleRefresh);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const cleanupFriendRequest = onEvent('friend_request', async () => {
      await fetchFriendRequests();
    });

    const cleanupNewMessage = onEvent('new_message_notification', async () => {
      await fetchConversations();
    });

    const cleanupFriendAccepted = onEvent('friend_accepted', async () => {
      await fetchFriendRequests();
      await fetchConversations();
    });

    const cleanupFriendDeclined = onEvent('friend_declined', async () => {
      await fetchFriendRequests();
    });

    const cleanupOnlineList = onEvent('online_users_list', (users: string[]) => {
      setOnlineUsers(new Set(users));
    });

    const cleanupUserOnline = onEvent('user_online', ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    });

    const cleanupUserOffline = onEvent('user_offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      cleanupFriendRequest();
      cleanupFriendAccepted();
      cleanupFriendDeclined();
      cleanupOnlineList();
      cleanupUserOnline();
      cleanupUserOffline();
      cleanupNewMessage();
    };
  }, [socket, onEvent]);

  return (
    <div className="w-full md:w-[350px] bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0 z-20">
      {/* Profile Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="relative w-12 h-12 rounded-full ring-2 ring-white/60 hover:ring-indigo-300 transition-all cursor-pointer overflow-hidden shadow-md group"
            title="Nhấn để đổi ảnh đại diện"
          >
            <ChatAvatar avatarUrl={user?.avatar} fullName={user?.fullName || 'User'} size={48} />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                <svg className="animate-spin w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 animate-fade-in-up">
              <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-medium"
              >
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                Thay đổi ảnh đại diện
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp"
              />
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 font-medium"
              >
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 ml-1">
          <h3 className="font-bold text-slate-800 text-[15px] truncate">{user?.fullName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-xs text-slate-500 font-medium tracking-wide">Trực tuyến</span>
          </div>
        </div>
        <button
          onClick={() => setIsFriendRequestsOpen(true)}
          className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/60 rounded-xl transition-all"
          title="Lời mời kết bạn"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {requestsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
              {requestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Action Bar */}
      <div className="px-4 pb-4 border-b border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tin nhắn</h2>
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="text-[13px] flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/80 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Tạo nhóm
          </button>
        </div>
        <SearchUser onSelectUser={(user) => {
          if (onSelectStranger) onSelectStranger(user);
        }} />
      </div>

      {/* Stranger Folder Toggle */}
      {isStrangerFolderOpen && (
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-100/50 flex items-center gap-2">
          <button
            onClick={() => setIsStrangerFolderOpen(false)}
            className="p-1 -ml-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all flex items-center justify-center"
            title="Quay lại danh sách chính"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-[14px] font-bold text-slate-700">Tin nhắn người lạ</span>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {error && <div className="m-4 p-3 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-xl text-xs font-medium text-center border border-red-100">{error}</div>}

        {(() => {
          const friendIds = new Set(friends.map(f => f._id));

          const deduplicateConversations = (convs: Conversation[]) => {
            const seenUsers = new Set<string>();
            return convs.filter(c => {
              if (c.IsGroupChat) return true;
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
              <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-slate-500 text-sm font-semibold">Chưa có cuộc trò chuyện nào</p>
                <p className="text-slate-400 text-xs mt-1">Hãy tìm kiếm hoặc tạo nhóm để bắt đầu</p>
              </div>
            );
          }

          return (
            <ul className="p-2.5 space-y-1">
              {!isStrangerFolderOpen && strangerConversations.length > 0 && (
                <li
                  onClick={() => setIsStrangerFolderOpen(true)}
                  className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-200/50 mb-1 group"
                >
                  <div className="relative w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-orange-100 text-orange-500 group-hover:bg-orange-200 transition-colors shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[15px] truncate text-orange-700">Tin nhắn người lạ</h4>
                    <p className="text-[13px] truncate text-orange-500/90 font-medium">
                      {strangerConversations.length} cuộc trò chuyện
                    </p>
                  </div>
                </li>
              )}

              {listToRender.map((conv) => (
                <li
                  key={conv.ConversationId}
                  onClick={() => onSelectConversation(conv.ConversationId)}
                  className={`relative flex items-center gap-3 p-2.5 pr-11 rounded-xl cursor-pointer transition-colors duration-200 group ${activeConversationId === conv.ConversationId
                      ? 'bg-indigo-50/80 shadow-sm ring-1 ring-indigo-100'
                      : 'hover:bg-slate-200/50'
                    }`}
                >
                  <div className="relative shrink-0">
                    <ChatAvatar avatarUrl={conv.OtherUserAvatar} fullName={conv.ChatName || '?'} size={48} />
                    {conv.IsGroupChat ? (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <div className="bg-purple-500 text-white rounded-full w-[14px] h-[14px] flex items-center justify-center">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        </div>
                      </div>
                    ) : (
                      conv.OtherUserId && onlineUsers.has(conv.OtherUserId) && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-white">
                          <div className="bg-emerald-500 rounded-full w-3.5 h-3.5 border-2 border-white shadow-sm" title="Trực tuyến" />
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-[15px] truncate mb-0.5 ${activeConversationId === conv.ConversationId ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {conv.ChatName}
                    </h4>
                    <p className={`text-[13px] font-medium truncate ${activeConversationId === conv.ConversationId ? 'text-indigo-600/80' : 'text-slate-500'}`}>
                      Nhấn để xem tin nhắn...
                    </p>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2" ref={openConversationMenuId === conv.ConversationId ? conversationMenuRef : undefined}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenConversationMenuId((current) => current === conv.ConversationId ? null : conv.ConversationId);
                      }}
                      disabled={deletingConversationId === conv.ConversationId}
                      className={`p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-all disabled:opacity-50 ${
                        openConversationMenuId === conv.ConversationId ? 'opacity-100 bg-white shadow-sm' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Tuy chon"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 10a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4z" />
                      </svg>
                    </button>

                    {openConversationMenuId === conv.ConversationId && (
                      <div
                        className="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-40 animate-fade-in-up"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteConversation(conv)}
                          className="w-full px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-8 0h10" />
                          </svg>
                          Xóa đoạn chat
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
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
            fetchFriendRequests();
          }}
        />
      )}
    </div>
  );
};
