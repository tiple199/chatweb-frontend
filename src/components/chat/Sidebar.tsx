import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { conversationApi } from '../../api/conversation.api';
import type { Conversation } from '../../types/conversation.type';
import { useAuthStore } from '../../store/auth.store';
import { SearchUser } from './SearchUser';

interface SidebarProps {
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
}

/** Tạo màu gradient theo tên (giống Telegram) */
const getAvatarChar = (name: string) => name?.charAt(0).toUpperCase() || '?';

export const Sidebar: React.FC<SidebarProps> = ({ activeConversationId, onSelectConversation }) => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await conversationApi.getConversations();
        setConversations(res.data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || 'Không thể tải danh sách chat');
        }
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="sidebar-container">
      {/* Profile Header */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          {getAvatarChar(user?.fullName || '')}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.fullName}</div>
          <div className="sidebar-user-status">Trực tuyến</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="sidebar-search-wrap">
        <div className="search-wrap-inner">
          <span className="search-icon">🔍</span>
          <SearchUser onSelectUser={(u) => {
            //để tạm
            console.log("Selected user from search:", u);
          }} />
        </div>
      </div>

      {/* Conversation List */}
      <div className="sidebar-list">
        {error && (
          <div style={{ padding: '12px 16px', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {conversations.length === 0 && !error ? (
          <div className="sidebar-empty">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗨️</div>
            Chưa có tin nhắn nào
          </div>
        ) : (
          <>
            <div className="sidebar-section-label">Tin nhắn</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {conversations.map((conv) => (
                <li
                  key={conv.ConversationId}
                  id={`conv-${conv.ConversationId}`}
                  onClick={() => onSelectConversation(conv.ConversationId)}
                  className={`sidebar-conv-item${activeConversationId === conv.ConversationId ? ' active' : ''}`}
                >
                  <div className="conv-avatar">
                    {getAvatarChar(conv.ChatName)}
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.ChatName}</div>
                    <div className="conv-preview">
                      {conv.IsGroupChat ? '👥 Nhóm trò chuyện' : 'Nhấn để xem tin nhắn'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};