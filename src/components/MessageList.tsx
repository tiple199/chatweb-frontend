import { useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { ChatAvatar } from "./ChatAvatar";
import { isSameSender, isSameDay, formatDaySeparator } from "../lib/utils";

export const MessageList = ({ conversationId }: { conversationId: string }) => {
  const { messages, loadMore, hasMore, loadingMore, user, page } = useChat(conversationId);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollHeight = useRef<number>(0);

  // 1. Xử lý khi người dùng cuộn lên đỉnh để load thêm tin cũ
  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0 && hasMore && !loadingMore) {
      lastScrollHeight.current = scrollRef.current.scrollHeight;
      loadMore();
    }
  };

  // 2. Giữ vị trí cuộn khi load thêm tin nhắn cũ (Infinite Scroll)
  useEffect(() => {
    if (scrollRef.current && lastScrollHeight.current > 0) {
      const scrollDiff = scrollRef.current.scrollHeight - lastScrollHeight.current;
      scrollRef.current.scrollTop = scrollDiff;
      lastScrollHeight.current = 0;
    }
  }, [messages]);

  // 3. Cuộn xuống cuối khi có tin nhắn mới (Real-time)
  useEffect(() => {
    if (scrollRef.current && page === 1 && !loadingMore) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, page, loadingMore]);

  return (
    <div 
      ref={scrollRef} 
      onScroll={handleScroll}
      className="chat-window-scroll"
    >
      {/* Loading indicator cho phân trang ngược */}
      {loadingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
          <div style={{
            width: '20px', height: '20px',
            border: '2px solid rgba(79,142,247,0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      )}
      
      {!hasMore && messages.length > 0 && (
        <div className="day-separator">
          <div className="day-separator-line" />
          <span className="day-separator-text">Bắt đầu cuộc trò chuyện</span>
          <div className="day-separator-line" />
        </div>
      )}

      {messages.map((msg, index) => {
        // Xử lý an toàn cho SenderId
        const senderId = msg.SenderId;
        
        if (!user || !senderId) return null;
        
        const isMine = senderId === user._id;
        
        // Kiểm tra xem có cần hiển thị day separator
        const prevMsg = index > 0 ? messages[index - 1] : null;
        const showDaySeparator = !prevMsg || !isSameDay(prevMsg.CreatedAt, msg.CreatedAt);
        
        // Kiểm tra xem có cần hiển thị avatar/sender name
        const isFirstFromSender = !prevMsg || !isSameSender(msg, prevMsg);
        const showAvatar = !isMine && isFirstFromSender;
        
        return (
          <div key={msg.MessageId}>
            {/* Day separator */}
            {showDaySeparator && (
              <div className="day-separator">
                <div className="day-separator-line" />
                <span className="day-separator-text">{formatDaySeparator(msg.CreatedAt)}</span>
                <div className="day-separator-line" />
              </div>
            )}

            <div className={`msg-row ${isMine ? 'is-mine' : 'is-other'}`}>
              {/* Avatar hoặc spacing */}
              {isMine ? (
                <div className="msg-avatar-placeholder" />
              ) : showAvatar ? (
                <ChatAvatar 
                  avatarUrl={null} 
                  fullName={"User"} 
                  size={32} 
                />
              ) : (
                <div className="msg-avatar-placeholder" />
              )}
              
              <div className="msg-bubble-wrap">
                {/* Sender name (chỉ hiển thị khi là tin đầu từ người khác) */}
                {!isMine && isFirstFromSender && (
                  <p className="msg-sender-name">Người dùng</p>
                )}
                
                {/* Message bubble */}
                <div className="msg-bubble">
                  <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '1.55' }}>
                    {msg.Content}
                  </p>
                  <span className="msg-time">
                    {new Date(msg.CreatedAt).toLocaleTimeString("vi-VN", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};