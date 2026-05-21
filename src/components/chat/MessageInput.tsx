import React, { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useSocket } from '../../hooks/useSocket';

interface MessageInputProps {
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [content, setContent] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingActiveRef = useRef(false);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { sendRealtimeMessage, socket } = useSocket(conversationId);

  const emitStopTyping = () => {
    if (!typingActiveRef.current) return;

    socket?.emit('stop_typing', { roomId: conversationId });
    typingActiveRef.current = false;
  };

  const emitTypingIfNeeded = () => {
    if (typingActiveRef.current) return;

    socket?.emit('typing', { roomId: conversationId });
    typingActiveRef.current = true;
  };

  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
      emitStopTyping();
    };
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!content.trim() && !file) || isSending) return;

    setIsSending(true);
    try {
      emitStopTyping();

      if (file) {
        alert('Gửi file qua socket chưa được backend hỗ trợ trong phiên bản này.');
        return;
      }

      sendRealtimeMessage({
        MessageId: '', 
        ConversationId: conversationId,
        SenderId: '',
        MessageType: 'text',
        Content: content.trim(),
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
        IsDeletedBySender: false,
        IsDeletedForAll: false,
      });
      
      setContent('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Gửi tin nhắn thất bại.');
      } else {
        alert('Lỗi hệ thống khi gửi tin nhắn.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form onSubmit={handleSend} className="message-input-container">
      <div className="input-wrapper">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="input-attach-btn" title="Đính kèm tệp">
          📎
        </label>

        {file && <span className="file-badge">{file.name}</span>}

        <input
          id="message-input"
          type="text"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const nextValue = e.target.value;
            setContent(nextValue);

            if (nextValue.trim().length > 0) {
              if (stopTypingTimeoutRef.current) {
                clearTimeout(stopTypingTimeoutRef.current);
                stopTypingTimeoutRef.current = null;
              }
              emitTypingIfNeeded();
              return;
            }

            if (stopTypingTimeoutRef.current) {
              clearTimeout(stopTypingTimeoutRef.current);
            }

            stopTypingTimeoutRef.current = setTimeout(() => {
              emitStopTyping();
            }, 0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="input-field"
          disabled={isSending}
          autoComplete="off"
        />

        <button
          id="send-button"
          type="submit"
          disabled={isSending || (!content.trim() && !file)}
          className="send-button"
          aria-label="Gửi tin nhắn"
        >
          {isSending ? '⏳' : '➤'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;