import React, { useEffect, useRef, useState} from 'react';
import { AxiosError, type AxiosProgressEvent } from 'axios';
import { useSocket } from '../../hooks/useSocket';
import { messageApi } from '../../api/message.api';

import type { Message } from '../../types/message.type';

interface MessageInputProps {
  conversationId: string;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, editingMessage, onCancelEdit }) => {
  const [content, setContent] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
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

  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.Content);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
    } else {
      setContent('');
    }
  }, [editingMessage]);

  const emitTypingIfNeeded = () => {
    if (!typingActiveRef.current) {
      socket?.emit('typing', { roomId: conversationId });
      typingActiveRef.current = true;
    }

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    stopTypingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 150000);
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
    setUploadProgress(0);
    try {
      emitStopTyping();

      if (editingMessage) {
        await messageApi.editMessage(editingMessage.MessageId, content.trim());
        if (onCancelEdit) onCancelEdit();
      } else if (file) {
        await messageApi.sendMessage(conversationId, content.trim(), file, (progressEvent: AxiosProgressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        });
      } else {
        // Gửi tin nhắn text thường qua Socket (optimistic update)
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
      }
      
      setContent('');
      setFile(null);
      setUploadProgress(0);
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
  const showUploadProgress = isSending && file;

  return (
    <div className="absolute bottom-6 left-0 right-0 px-4 md:px-8 pointer-events-none z-20">
      <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-[2rem] pointer-events-auto transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 focus-within:bg-white shadow-sm">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
          disabled={!!editingMessage}
        />
        <label htmlFor="file-upload" className={`cursor-pointer p-3 rounded-full transition-all self-end mb-0.5 ${!!editingMessage ? 'opacity-50 pointer-events-none text-slate-400' : file ? 'text-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-100' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50'}`} title="Đính kèm file">
          <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
        </label>
        
        <div className="flex-1 flex flex-col justify-end bg-transparent rounded-2xl overflow-hidden mb-0.5">
          {file && (
            <div className="flex items-start gap-3 px-3 py-3 bg-indigo-50/60 border-b border-indigo-100/50 relative rounded-t-xl mx-2 mt-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-slate-700 truncate pr-6">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                disabled={isSending}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {showUploadProgress && (
            <div className="px-3 pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Đang tải file lên</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-150 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <input
            type="text"
            value={content}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const nextValue = e.target.value;
              setContent(nextValue);

              if (nextValue.trim().length > 0) {
                emitTypingIfNeeded();
                return;
              }

              if (stopTypingTimeoutRef.current) {
                clearTimeout(stopTypingTimeoutRef.current);
              }

              emitStopTyping();
            }}
            placeholder={file ? "Thêm ghi chú..." : "Nhập tin nhắn..."}
            className="w-full px-2 py-3 bg-transparent focus:outline-none text-[15px] placeholder:text-slate-400 font-medium disabled:opacity-50"
            disabled={isSending}
            autoComplete="off"
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSending || (!content.trim() && !file)}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm disabled:shadow-none self-end mb-0.5 shrink-0 active:scale-95"
          title="Gửi"
        >
          {isSending ? (
            <svg className="animate-spin w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-[22px] h-[22px] ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;