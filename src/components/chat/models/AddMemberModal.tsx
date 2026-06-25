import React, { useState } from 'react';
import { SearchUser } from '../SearchUser';
import type { User } from '../../../types/user.type';
import { participantApi } from '../../../api/conversation.api';
import { AxiosError } from 'axios';

interface AddMemberModalProps {
  conversationId: string;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ conversationId, onClose }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdd = async () => {
    if (!selectedUser) {
      setError('Vui lòng chọn một người dùng');
      return;
    }

    setIsAdding(true);
    setError('');
    setSuccess('');
    
    try {
      await participantApi.addMember(conversationId, selectedUser._id);
      setSuccess(`Đã thêm ${selectedUser.fullName} vào nhóm thành công!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Không thể thêm thành viên này');
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden flex flex-col transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Thêm thành viên
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
          {success && <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">{success}</div>}
          
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tìm kiếm người dùng</label>
            <SearchUser onSelectUser={setSelectedUser} />
          </div>

          {selectedUser && (
            <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{selectedUser.fullName}</h4>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Bỏ chọn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleAdd}
            disabled={!selectedUser || isAdding}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAdding ? 'Đang thêm...' : 'Thêm vào nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
};
