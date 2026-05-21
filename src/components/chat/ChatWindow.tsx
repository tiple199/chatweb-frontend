import React, { useEffect, useState, useRef } from 'react';
import { AxiosError } from 'axios';
import { messageApi } from '../../api/message.api';
import type { Message } from '../../types/message.type';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/auth.store';
import MessageInput from './MessageInput';
import { mapBackendMessage, mapBackendMessages, type BackendMessage } from '../../lib/messageMapper';

interface ChatWindowProps {
  conversationId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { onMessageReceived, onTyping, onStopTyping } = useSocket(conversationId);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setError('');
        const res = await messageApi.getMessages(conversationId.toString());
        setMessages(mapBackendMessages(res.data.data?.messages || []));
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || 'Lỗi khi tải tin nhắn.');
        } else {
          setError('Lỗi không xác định khi tải tin nhắn.');
        }
      }
    };
    if (conversationId) fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    onMessageReceived((newMessage: BackendMessage) => {
      const mappedMessage = mapBackendMessage(newMessage);
      if (mappedMessage.ConversationId === conversationId) {
        setMessages((prev) => [...prev, mappedMessage]);
      }
    });
  }, [conversationId, onMessageReceived]);

  useEffect(() => {
    onTyping((payload) => {
      if (payload.roomId === conversationId) {
        setIsTyping(true);
      }
    });

    onStopTyping((payload) => {
      if (payload.roomId === conversationId) {
        setIsTyping(false);
      }
    });
  }, [conversationId, onTyping, onStopTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window-shell">
      {error && <div className="error-banner">{error}</div>}

      <div className="chat-window-scroll">
        {messages.map((msg) => {
          const isMine = msg.SenderId === user?._id;
          return (
            <div
              key={msg.MessageId}
              className={`msg-row ${isMine ? 'is-mine' : 'is-other'}`}
            >
              {/* Avatar placeholder on mine side */}
              {isMine ? (
                <div className="msg-avatar-placeholder" />
              ) : (
                <div className="msg-avatar">
                  U
                </div>
              )}

              <div className="msg-bubble-wrap">
                {/* Image attachment */}
                {msg.MessageType === 'image' && msg.FileName && (
                  <img
                    src={msg.FileName}
                    alt="attachment"
                    style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '4px' }}
                  />
                )}
                {/* File attachment */}
                {msg.MessageType === 'file' && msg.FileName && (
                  <a
                    href={msg.FileName}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                      color: isMine ? 'rgba(255,255,255,0.85)' : 'var(--primary)',
                      fontSize: '13px',
                      textDecoration: 'underline',
                    }}
                  >
                    📄 Tải file đính kèm
                  </a>
                )}

                <div className="msg-bubble">
                  <p style={{ margin: 0 }}>{msg.Content}</p>
                  <span
                    className="msg-time"
                    style={{ color: isMine ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}
                  >
                    {new Date(msg.CreatedAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="chat-typing-indicator">
          <div className="typing-dots">
            <span /><span /><span />
          </div>
          Đang nhập...
        </div>
      )}

      <MessageInput conversationId={conversationId} />
    </div>
  );
};