import React from 'react';
import type { Message } from '../../types/message.type';

interface MessageItemProps {
  message: Message;
  isMine: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isMine }) => {
  return (
    <div className={`msg-row ${isMine ? 'is-mine' : 'is-other'}`}>
      {/* Avatar placeholder / spacing */}
      <div className="msg-avatar-placeholder" />

      <div className="msg-bubble-wrap">
        {/* Render Hình ảnh */}
        {message.MessageType === 'image' && message.FileName && (
          <img
            src={message.FileName}
            alt="Đính kèm"
            style={{
              maxWidth: '100%',
              borderRadius: '12px',
              marginBottom: '4px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        {/* Render File */}
        {message.MessageType === 'file' && message.FileName && (
          <a
            href={message.FileName}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.15)',
              borderRadius: '10px',
              color: isMine ? 'rgba(255,255,255,0.85)' : 'var(--primary)',
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            📄 <span style={{ textDecoration: 'underline' }}>Tải file đính kèm</span>
          </a>
        )}

        {/* Nội dung text */}
        <div className="msg-bubble">
          {message.Content && (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {message.Content}
            </p>
          )}
          {/* Thời gian */}
          <span className="msg-time">
            {new Date(message.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};