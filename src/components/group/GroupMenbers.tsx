import React, { useEffect, useState, useRef } from 'react';
import { AxiosError } from 'axios';
import { participantApi } from '../../api/conversation.api';
import type { ConversationParticipant } from '../../types/conversation.type';
import { useAuthStore } from '../../store/auth.store';

interface GroupMembersProps {
  conversationId: string;
}

export const GroupMembers: React.FC<GroupMembersProps> = ({ conversationId }) => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<ConversationParticipant[]>([]);
  const [error, setError] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);

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
      setMembers(members.filter(m => m.userId !== userId));
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || "Không có quyền hoặc lỗi hệ thống");
      }
    }
  };

  const isCurrentUserAdmin = members.find(m => m.userId === user?._id)?.role === 'admin';

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="font-bold mb-3">Thành viên ({members.length})</h3>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <ul ref={menuRef}>
        {members.map(member => (
          <li key={member.userId} className="relative flex justify-between items-center mb-2 text-sm p-1 rounded hover:bg-slate-50">
            <span>{member.fullName} - {member.role === 'admin' ? <span className="text-indigo-600 font-semibold">Admin</span> : 'Thành viên'}</span>
            
            <button
              onClick={() => setOpenMenuId(openMenuId === member.userId ? null : member.userId)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              title="Tùy chọn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 10a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </button>

            {openMenuId === member.userId && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5">
                {isCurrentUserAdmin && member.userId !== user?._id && member.role !== 'admin' ? (
                  <button
                    onClick={() => {
                      handleRemove(member.userId);
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
          </li>
        ))}
      </ul>
    </div>
  );
};