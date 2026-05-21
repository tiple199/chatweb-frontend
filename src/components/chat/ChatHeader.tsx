import React from 'react';
import type { Conversation } from '../../types/conversation.type';

interface ChatHeaderProps {
  conversation: Conversation | null;
  onOpenSidebar?: () => void; // Dùng cho mobile 
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onOpenSidebar }) => {
  if (!conversation) {
    return (
      <div className="chat-header-placeholder">
        Chọn một cuộc trò chuyện để bắt đầu
      </div>
    );
  }

  return (
    <div className="chat-header">
      <div className="chat-header-left">
        {/* Nút menu cho mobile */}
        <button
          onClick={onOpenSidebar}
          className="chat-header-btn"
          style={{ display: 'none' }}
          aria-label="Mở sidebar"
        >
          ☰
        </button>

        <div className="chat-header-avatar">
          {conversation.ChatName.charAt(0).toUpperCase()}
        </div>

        <div className="chat-header-info">
          <h2>{conversation.ChatName}</h2>
          <div className="chat-header-status">
            {conversation.IsGroupChat ? '👥 Nhóm trò chuyện' : '● Đang hoạt động'}
          </div>
        </div>
      </div>

      <div className="chat-header-actions">
        <button
          id="header-search-btn"
          className="chat-header-btn"
          title="Tìm kiếm tin nhắn"
          aria-label="Tìm kiếm"
        >
          🔍
        </button>
        <button
          id="header-info-btn"
          className="chat-header-btn"
          title="Thông tin"
          aria-label="Thông tin"
        >
          ℹ️
        </button>
      </div>
    </div>
  );
};