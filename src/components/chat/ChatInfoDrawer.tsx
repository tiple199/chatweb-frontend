import React, { useState, useEffect } from 'react';
import { messageApi } from '../../api/message.api';
import { participantApi } from '../../api/conversation.api';
import type { Message } from '../../types/message.type';
import type { ConversationParticipant } from '../../types/conversation.type';
import { mapBackendMessage } from '../../lib/messageMapper';
import { normalizeMediaUrl } from '../../lib/utils';
import { GroupMembers } from '../group/GroupMenbers';

interface ChatInfoDrawerProps {
  conversationId: string;
  onClose: () => void;
}

type TabType = 'images' | 'videos' | 'files' | 'links';

export const ChatInfoDrawer: React.FC<ChatInfoDrawerProps> = ({ conversationId, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<ConversationParticipant[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        // Gọi API search với keyword rỗng để lấy toàn bộ tin nhắn
        const res = await messageApi.searchMessages(conversationId, '');
        const mapped = (res.data as any).data?.map(mapBackendMessage) || [];
        setMessages(mapped);
      } catch (e) {
        console.error('Lỗi khi tải thông tin đa phương tiện:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [conversationId]);

  useEffect(() => {
    const fetchMembers = async () => {
      // Mocking member data
      try {
        const res = await participantApi.getParticipants(conversationId);
        setMembers(res.data);
      } catch (e) {
        console.error('Lỗi khi tải danh sách thành viên:', e);
      }
    };

    fetchMembers();
  }, []);


  const leaveGroup = async () => {
    // Xác nhận trước khi rời nhóm
    if (!window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm chat này?')) {
      return;
    }
    try {
      await participantApi.leaveGroup(conversationId);
      alert('Bạn đã rời khỏi nhóm chat.');
      // diều hướng người dùng về trang chính
      window.location.href = '/';
      onClose(); // Đóng drawer sau khi rời nhóm
    }
    catch (e) {
      console.error('Lỗi khi rời khỏi nhóm:', e);
      alert('Có lỗi xảy ra khi rời khỏi nhóm.');
    } 
  }

  const images = messages.filter(m => m.MessageType === 'image' && m.FileName);
  const videos = messages.filter(m => m.MessageType === 'video' && m.FileName);
  const files = messages.filter(m => m.MessageType === 'file' && m.FileName);
  // Đơn giản hóa việc tìm link bằng regex
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = messages.filter(m => m.Content && linkRegex.test(m.Content));

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex justify-center items-center">
          <svg className="animate-spin w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      );
    }

    switch (activeTab) {
      case 'images':
        return (
          <div className="grid grid-cols-3 gap-1 p-2">
            {images.length === 0 && <div className="col-span-3 text-center py-8 text-slate-400 text-sm">Chưa có hình ảnh nào</div>}
            {images.map(m => (
              <a key={m.MessageId} href={normalizeMediaUrl(m.FileUrl) || m.FileName} target="_blank" rel="noopener noreferrer" className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity">
                <img src={normalizeMediaUrl(m.FileUrl) || m.FileName} alt="Media" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        );
      case 'videos':
        return (
          <div className="grid grid-cols-2 gap-2 p-2">
            {videos.length === 0 && <div className="col-span-2 text-center py-8 text-slate-400 text-sm">Chưa có video nào</div>}
            {videos.map(m => (
              <a key={m.MessageId} href={normalizeMediaUrl(m.FileUrl) || m.FileName} target="_blank" rel="noopener noreferrer" className="aspect-square bg-slate-800 rounded-lg overflow-hidden relative flex items-center justify-center group">
                <video src={normalizeMediaUrl(m.FileUrl) || m.FileName} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                <svg className="w-8 h-8 text-white relative z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              </a>
            ))}
          </div>
        );
      case 'files':
        return (
          <div className="flex flex-col gap-2 p-2">
            {files.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Chưa có tệp tin nào</div>}
            {files.map(m => (
              <a key={m.MessageId} href={normalizeMediaUrl(m.FileUrl) || m.FileName} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{m.FileName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{new Date(m.CreatedAt).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        );
      case 'links':
        return (
          <div className="flex flex-col gap-2 p-2">
            {links.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Chưa có liên kết nào</div>}
            {links.map(m => {
              const matches = m.Content.match(linkRegex);
              if (!matches) return null;
              return matches.map((link, idx) => (
                <a key={`${m.MessageId}-${idx}`} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate hover:underline">{link}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.Sender?.fullName} • {new Date(m.CreatedAt).toLocaleDateString()}</p>
                  </div>
                </a>
              ));
            })}
          </div>
        );
    }
  };

  // 3. Render Button Rời nhóm màu đỏ & icon
  const renderStickyButton = () => {
    if (members.length <= 2) return null; // Chỉ hiển thị nút rời nhóm nếu là nhóm chat (nhiều hơn 2 thành viên)

    return (
      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3">
        <button 
          onClick={leaveGroup} 
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-semibold transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Rời khỏi nhóm
        </button>
      </div>
    );
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full animate-fade-in-left relative z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-slate-50">
        <h2 className="font-bold text-slate-800">Kho lưu trữ</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex border-b border-slate-200 shrink-0">
        <button 
          onClick={() => setActiveTab('images')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'images' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
        >
          Ảnh
        </button>
        <button 
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'videos' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
        >
          Video
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'files' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
        >
          File
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'links' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
        >
          Link
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
        {renderContent()}
      </div>

      <GroupMembers conversationId={conversationId} />
      {renderStickyButton()}
    </div>
  );
}
