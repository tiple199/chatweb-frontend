import React, { useEffect, useState, useRef } from 'react';
import { AxiosError } from 'axios';
import { messageApi } from '../../api/message.api';
import type { Message } from '../../types/message.type';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/auth.store';
import MessageInput from './MessageInput';
import { mapBackendMessage, mapBackendMessages, type BackendMessage } from '../../lib/messageMapper';
import { MessageItem } from './MessageItem';

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
    const cleanup = onMessageReceived((newMessage: BackendMessage) => {
      const mappedMessage = mapBackendMessage(newMessage);
      if (mappedMessage.ConversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.MessageId === mappedMessage.MessageId)) {
            return prev;
          }
          return [...prev, mappedMessage];
        });
      }
    });

    return cleanup;
  }, [conversationId, onMessageReceived]);

  useEffect(() => {
    const cleanupTyping = onTyping((payload) => {
      if (payload.roomId === conversationId) {
        setIsTyping(true);
      }
    });

    const cleanupStopTyping = onStopTyping((payload) => {
      if (payload.roomId === conversationId) {
        setIsTyping(false);
      }
    });

    return () => {
      cleanupTyping();
      cleanupStopTyping();
    };
  }, [conversationId, onTyping, onStopTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="absolute inset-0 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
      {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-medium shadow-md border border-red-200">{error}</div>}

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-28 custom-scrollbar">
        {messages.map((msg) => {
          const isMine = msg.SenderId === user?._id;
          // Show date separator logically... (simplified for now)
          return <MessageItem key={msg.MessageId} message={msg} isMine={isMine} />;
        })}
        
        {isTyping && (
          <div className="flex items-center gap-3 mt-4 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <MessageInput conversationId={conversationId} />
    </div>
  );
};