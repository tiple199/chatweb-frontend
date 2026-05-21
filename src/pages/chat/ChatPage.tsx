import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { Sidebar } from '../../components/chat/Sidebar';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { useAuthStore } from '../../store/auth.store';
import type { Conversation } from '../../types/conversation.type';
import { conversationApi } from '../../api/conversation.api';
import { authApi } from '../../api/auth.api';

export const ChatPage: React.FC = () => {
  const { logout } = useAuthStore();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Hàm xử lý khi người dùng click chọn một cuộc trò chuyện ở Sidebar
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    try {
      const res = await conversationApi.getConversations(); 
      const current = res.data.find(c => c.ConversationId === id);
      if (current) {
        setActiveConversation(current);
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("Lỗi khi tải thông tin cuộc trò chuyện:", err.response?.data?.message || err.message);
      } else {
        console.error("Lỗi không xác định khi tải cuộc trò chuyện.");
      }
    }
  };

  // Hàm xử lý đăng xuất an toàn
  const handleLogout = async () => {
    // Lấy token từ localStorage (hoặc store) để gửi lên backend hủy phiên làm việc
    const refreshToken = localStorage.getItem('refreshToken') || ''; 
    
    try {
      if (refreshToken) { 
        await authApi.logout({ refreshToken });
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("Lỗi gọi API đăng xuất:", err.response?.data?.message || err.message);
      }
    } finally {
      // Đảm bảo luôn xóa thông tin user ở frontend cho dù gọi API có lỗi hay không
      logout(); 
    }
  };

  return (
    <div className="chat-layout">
      {/* Cột trái: Sidebar chứa danh sách chat */}
      <Sidebar 
        activeConversationId={activeConversationId} 
        onSelectConversation={handleSelectConversation} 
      />

      {/* Cột phải: Khu vực làm việc chính */}
      <div className="chat-main-container">
        {/* Header trên cùng (Hiển thị tên người đang chat / tên nhóm) */}
        <ChatHeader conversation={activeConversation} />

        {/* Nội dung bên dưới Header */}
        {activeConversationId ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Truyền ID cuộc trò chuyện xuống để render tin nhắn */}
            <ChatWindow conversationId={activeConversationId} />
          </div>
        ) : (
          /* Màn hình chờ khi chưa chọn cuộc trò chuyện nào */
          <div className="chat-empty-state">
            <div className="empty-icon-wrap">💬</div>
            <h2 className="empty-title">Bắt đầu trò chuyện</h2>
            <p className="empty-subtitle">
              Chọn một cuộc trò chuyện bên trái hoặc tìm kiếm người dùng để nhắn tin
            </p>
            <button 
              id="logout-btn"
              onClick={handleLogout} 
              className="logout-btn"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
};