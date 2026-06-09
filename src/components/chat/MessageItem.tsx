import React from 'react';
import type { Message } from '../../types/message.type';
import { normalizeAvatarUrl, normalizeMediaUrl } from '../../lib/utils';

interface MessageItemProps {
  message: Message;
  isMine: boolean;
  onOpenMedia?: (payload: { url: string; type: string }) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isMine, onOpenMedia }) => {
  const senderAvatar = normalizeAvatarUrl(message.Sender?.avatar);
  const mediaUrl = normalizeMediaUrl(message.FileUrl);

  return (
    <div className={`flex w-full mb-6 group ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex shrink-0 items-center justify-center text-white text-xs font-bold mr-3 mt-auto shadow-sm overflow-hidden">
          {senderAvatar ? (
            <img src={senderAvatar} alt={message.Sender?.fullName} className="w-full h-full object-cover" />
          ) : (
            message.Sender?.fullName ? message.Sender.fullName[0].toUpperCase() : 'U'
          )}
        </div>
      )}
      
      <div className={`relative max-w-[70%] sm:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        <span className={`text-[11px] text-slate-500 mb-1 px-1 font-medium ${isMine ? 'text-right' : 'text-left'}`}>
          {message.Sender?.fullName || 'Người dùng'}
        </span>
        <div className={`p-3.5 shadow-sm relative ${
          isMine 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-blue-500/20' 
            : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-bl-sm shadow-slate-200/50'
        }`}>
          
          {message.MessageType === 'image' && message.FileUrl && (
            <div className="mb-2 overflow-hidden rounded-xl border border-black/5">
              {mediaUrl && (
                <button
                  type="button"
                  onClick={() => onOpenMedia?.({ url: mediaUrl, type: 'image' })}
                  className="block w-full cursor-zoom-in"
                  title="Phóng to ảnh"
                >
                  <img src={mediaUrl} alt="Đính kèm" className="max-w-full h-auto object-cover max-h-[300px]" loading="lazy" />
                </button>
              )}
            </div>
          )}
          
          {message.MessageType === 'video' && message.FileUrl && (
            <div className="mb-2 overflow-hidden rounded-xl border border-black/5 bg-black/10">
              {mediaUrl && <video src={mediaUrl} controls className="max-w-full h-auto max-h-[300px]" />}
            </div>
          )}
          
          {message.MessageType === 'file' && message.FileUrl && (
            <a 
              href={mediaUrl || message.FileUrl} 
              target="_blank" 
              rel="noreferrer" 
              className={`flex items-center gap-2 p-2.5 mb-2 rounded-xl transition-colors ${
                isMine ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">{message.FileName || 'Tải file đính kèm'}</span>
                {message.FileSize && <span className="text-[10px] opacity-70">{(message.FileSize / 1024 / 1024).toFixed(2)} MB</span>}
              </div>
            </a>
          )}
          
          {/* Nội dung text */}
          {message.Content && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.Content}</p>}
        </div>
        
        {/* Thời gian */}
        <span className={`text-[11px] font-medium mt-1.5 px-1 ${
          isMine ? 'text-slate-400' : 'text-slate-400'
        }`}>
          {new Date(message.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isMine && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex shrink-0 items-center justify-center text-white text-xs font-bold ml-3 mt-auto shadow-sm overflow-hidden">
          {senderAvatar ? (
            <img src={senderAvatar} alt={message.Sender?.fullName} className="w-full h-full object-cover" />
          ) : (
            message.Sender?.fullName ? message.Sender.fullName[0].toUpperCase() : 'U'
          )}
        </div>
      )}
    </div>
  );
};