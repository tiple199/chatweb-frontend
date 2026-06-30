import React, { useEffect, useState, useRef } from 'react';
import { AxiosError } from 'axios';
import { participantApi } from '../../api/conversation.api';
import type { ConversationParticipant } from '../../types/conversation.type';
import { useAuthStore } from '../../store/auth.store';
import { ChatAvatar } from '../ChatAvatar';
import { Key } from 'lucide-react';

interface GroupMembersProps {
  conversationId: string;
}

export const GroupMembers: React.FC<GroupMembersProps> = ({ conversationId }) => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<ConversationParticipant[]>([]);
  const [error, setError] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await participantApi.getParticipants(conversationId);
        setMembers(res.data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || 'Lỗi khi tải thành viên.');
        }
      }
    };
    fetchMembers();
  }, [conversationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemove = async (userId: string) => {
    if (!user) return;
    try {
      await participantApi.removeMember(conversationId, userId, user._id);
      setMembers(members.filter(m => (m.userId ?? m.UserId) !== userId));
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || "Không có quyền hoặc lỗi hệ thống");
      }
    }
  };

  const currentUserMember = members.find(m => {
    const mId = m.userId ?? m.UserId;
    return mId && mId === user?._id;
  });
  const isCurrentUserAdmin = (currentUserMember?.role ?? currentUserMember?.Role) === 'admin';

  if (members.length <= 2) return null; // Không hiển thị nếu chat 1-1

  return (
    <div className="border-t border-slate-100 p-4 bg-slate-50/50">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
        Thành viên ({members.length})
      </h3>
      {error && <p className="text-red-500 text-xs mb-2 ml-1">{error}</p>}
      
      <div className="flex flex-col gap-2" ref={menuRef}>
        {members.map((member) => {
          const memberId = member.userId ?? member.UserId;
          if (!memberId) return null;

          const isAdmin = (member.role ?? member.Role) === 'admin';

          return (
            <div key={memberId} className="relative flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow-sm ring-2 ring-white overflow-hidden">
                  <ChatAvatar 
                    avatarUrl={member?.avatar || null} 
                    fullName={member?.fullName || 'U'} 
                    size={32} 
                  />
                </div>
                
                {isAdmin && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-amber-400 p-0.5 rounded-full border border-white text-white">
                    <Key size={10} strokeWidth={3} />
                  </div>
                )}
              </div>

              <span className="text-sm font-medium text-slate-700 truncate">{member.fullName}</span>
              
              {isAdmin && (
                <span className="ml-auto shrink-0 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase">
                  Admin
                </span>
              )}

              <div className={`shrink-0 rounded-full hover:bg-slate-100 transition-all ${!isAdmin ? 'ml-auto' : ''}`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === memberId ? null : memberId);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Tùy chọn"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 10a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4z" />
                  </svg>
                </button>
              </div>

              {openMenuId === memberId && (
                <div className="absolute right-8 top-8 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-[60] py-1.5">
                  {isCurrentUserAdmin && memberId !== user?._id && !isAdmin ? (
                    <button
                      onClick={() => {
                        handleRemove(memberId);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-8 0h10" />
                      </svg>
                      Xóa thành viên
                    </button>
                  ) : (
                    <div className="px-4 py-2 text-sm text-slate-400">Không có tùy chọn</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};