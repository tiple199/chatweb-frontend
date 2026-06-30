import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../../types/message.type';
import { PollMessageItem } from './PollMessageItem';
import { normalizeAvatarUrl, normalizeMediaUrl } from '../../lib/utils';
import { ChatAvatar } from '../ChatAvatar';

interface MessageItemProps {
  message: Message;
  isMine: boolean;
  conversationId?: string;
  readByUsers?: { _id: string; fullName: string; avatar: string | null }[];
  onShowUserProfile?: (user: Partial<import('../../types/user.type').User>) => void;
  onOpenMedia?: (payload: { url: string; type: string }) => void;
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (message: Message) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isMine, conversationId, readByUsers = [], onShowUserProfile, onOpenMedia, onEditMessage, onDeleteMessage }) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  if (message.MessageType === 'system') {
    return (
      <div className="w-full flex justify-center my-3 animate-fade-in-up">
        <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[12px] font-medium border border-emerald-100 shadow-sm">
          {message.Content}
        </span>
      </div>
    );
  }

  const senderAvatar = normalizeAvatarUrl(message.Sender?.avatar);

  if (message.IsDeletedForAll) {
    return (
      <div className={`flex w-full mb-6 animate-fade-in-up ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <div 
            className="mr-3 mt-auto shrink-0 shadow-sm rounded-full overflow-hidden border border-slate-200 cursor-pointer"
            onClick={() => onShowUserProfile?.({
              _id: message.Sender?._id || '',
              fullName: message.Sender?.fullName || 'Người dùng',
              avatar: message.Sender?.avatar || ''
            })}
          >
            <ChatAvatar avatarUrl={senderAvatar} fullName={message.Sender?.fullName || 'Người dùng'} size={36} />
          </div>
        )}
        <div className={`relative max-w-[75%] sm:max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
          <div className="py-2.5 px-4 border border-slate-200 rounded-2xl bg-white text-slate-400 italic text-[14px] shadow-sm">
            Tin nhắn đã bị thu hồi
          </div>
        </div>
        {isMine && (
          <div className="ml-3 mt-auto shrink-0 shadow-sm rounded-full overflow-hidden border border-slate-200">
            <ChatAvatar avatarUrl={senderAvatar} fullName={message.Sender?.fullName || 'Người dùng'} size={36} />
          </div>
        )}
      </div>
    );
  }

  if (message.MessageType === 'poll') {
    return <PollMessageItem pollId={message.Content} conversationId={conversationId || ''} />;
  }

  const mediaUrl = normalizeMediaUrl(message.FileUrl);

  return (
    <div className={`flex w-full mb-6 group animate-fade-in-up ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <div 
          className="mr-3 mt-auto shrink-0 shadow-sm rounded-full overflow-hidden border border-slate-200 cursor-pointer"
          onClick={() => onShowUserProfile?.({
            _id: message.Sender?._id || '',
            fullName: message.Sender?.fullName || 'Người dùng',
            avatar: message.Sender?.avatar || ''
          })}
        >
          <ChatAvatar avatarUrl={senderAvatar} fullName={message.Sender?.fullName || 'Người dùng'} size={36} />
        </div>
      )}
      
      <div className={`relative max-w-[75%] sm:max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        <span className={`text-[11px] text-slate-500 mb-1.5 px-1 font-semibold ${isMine ? 'text-right' : 'text-left'}`}>
          {message.Sender?.fullName || 'Người dùng'}
        </span>
        
        <div className="relative group/bubble flex items-center">
          {isMine && (
            <div className={`absolute right-full mr-2 flex items-center opacity-0 group-hover/bubble:opacity-100 transition-opacity ${showOptions ? 'opacity-100' : ''}`} ref={optionsRef}>
              {(message.MessageType === 'file' || message.MessageType === 'image' || message.MessageType === 'video') && (message.FileUrl || mediaUrl) && (
                <a 
                  href={mediaUrl || message.FileUrl} 
                  download={message.FileName || "download"} 
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors inline-flex"
                  title="Tải xuống"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              )}
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors inline-flex"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-36 z-50">
                  {message.MessageType === 'text' && (
                    <button 
                      onClick={() => { setShowOptions(false); onEditMessage?.(message); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Chỉnh sửa
                    </button>
                  )}
                  <button 
                    onClick={() => { setShowOptions(false); onDeleteMessage?.(message); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Thu hồi
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={`py-2 px-3.5 relative ${
            isMine 
              ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm shadow-sm' 
              : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm shadow-sm'
          }`}>
          
          {message.MessageType === 'image' && (message.FileUrl || mediaUrl) && (
            <div className="mb-2 overflow-hidden rounded-2xl border border-black/5 shadow-sm">
              {mediaUrl && onOpenMedia ? (
                <button
                  type="button"
                  onClick={() => onOpenMedia({ url: mediaUrl, type: 'image' })}
                  className="block w-full cursor-zoom-in"
                  title="Phóng to ảnh"
                >
                  <img src={mediaUrl} alt="Đính kèm" className="max-w-full h-auto object-cover max-h-[300px]" loading="lazy" />
                </button>
              ) : (
                <img src={mediaUrl || message.FileUrl} alt="Đính kèm" className="max-w-full h-auto object-cover max-h-[300px]" loading="lazy" />
              )}
            </div>
          )}
          
          {message.MessageType === 'video' && (message.FileUrl || mediaUrl) && (
            <div className="mb-2 overflow-hidden rounded-2xl border border-black/5 bg-black/10 shadow-sm">
              <video src={mediaUrl || message.FileUrl} controls className="max-w-full h-auto max-h-[300px]" />
            </div>
          )}
          
          {message.MessageType === 'file' && (message.FileUrl || mediaUrl) && (
            <button 
              type="button"
              onClick={() => onOpenMedia && onOpenMedia({ url: mediaUrl || message.FileUrl || '', type: 'file' })}
              className={`w-full text-left flex items-center gap-3 p-3 mb-2 rounded-2xl transition-colors ${
                isMine ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
              }`}
            >
              <div className={`p-2 rounded-xl flex items-center justify-center ${isMine ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}>
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-[15px] font-semibold">{message.FileName || 'Tải file đính kèm'}</span>
                {message.FileSize && <span className="text-[11px] opacity-80 mt-0.5">{(message.FileSize / 1024 / 1024).toFixed(2)} MB</span>}
              </div>
            </button>
          )}
          
          {/* Nội dung text */}
          {message.Content && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed tracking-wide">{message.Content}</p>}
        </div>

        {!isMine && (message.MessageType === 'file' || message.MessageType === 'image' || message.MessageType === 'video') && (message.FileUrl || mediaUrl) && (
          <div className="absolute left-full ml-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center">
             <a 
                href={mediaUrl || message.FileUrl} 
                download={message.FileName || "download"} 
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors inline-flex"
                title="Tải xuống"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
          </div>
        )}
        </div>
        
        {/* Thời gian và Trạng thái */}
        <div className={`flex items-center gap-2 mt-2 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[11px] font-medium ${
            isMine ? 'text-slate-400' : 'text-slate-400'
          }`}>
            {new Date(message.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {/* Read Receipts for My Messages */}
          {isMine && (
            <div className="flex items-center">
              {readByUsers.length > 0 ? (
                <div className="flex -space-x-1.5 opacity-90 transition-all hover:opacity-100 cursor-pointer">
                  {readByUsers.slice(0, 3).map(user => (
                    <div key={user._id} className="relative z-10 ring-1 ring-white rounded-full bg-white shadow-sm" title={`Đã xem bởi ${user.fullName}`}>
                      <ChatAvatar avatarUrl={user.avatar} fullName={user.fullName} size={14} />
                    </div>
                  ))}
                  {readByUsers.length > 3 && (
                    <div className="relative z-0 w-[14px] h-[14px] rounded-full bg-slate-200 ring-1 ring-white flex items-center justify-center text-[7px] font-bold text-slate-600 shadow-sm">
                      +{readByUsers.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-indigo-300" title="Đã gửi">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isMine && (
        <div className="ml-3 mt-auto shrink-0 shadow-sm rounded-full overflow-hidden border border-slate-200">
          <ChatAvatar avatarUrl={senderAvatar} fullName={message.Sender?.fullName || 'Người dùng'} size={36} />
        </div>
      )}
    </div>
  );
};