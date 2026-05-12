import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { conversationApi } from '../../api/conversation.api';
import type { Conversation } from '../../types/conversation.type';
import { useAuthStore } from '../../store/auth.store';
import { SearchUser } from './SearchUser';

interface SidebarProps {
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeConversationId, onSelectConversation }) => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await conversationApi.getConversations();
        setConversations(res.data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || 'Không thể tải danh sách chat');
        }
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="w-full md:w-80 border-r bg-white flex flex-col h-full">
      {/* Profile Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-sm truncate">{user?.fullName}</h3>
          <span className="text-xs text-green-500">Trực tuyến</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b">
        <SearchUser onSelectUser={(user) => {
          //để tạm
          console.log("Selected user from search:", user);
        }} />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-3 text-red-500 text-xs text-center">{error}</div>}
        
        {conversations.length === 0 && !error ? (
          <div className="p-4 text-center text-gray-400 text-sm">Chưa có tin nhắn nào</div>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li 
                key={conv.ConversationId}
                onClick={() => onSelectConversation(conv.ConversationId)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                  activeConversationId === conv.ConversationId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <h4 className="font-semibold text-gray-800 text-sm truncate">{conv.ChatName}</h4>
                {/* Ở đây có thể render LatestMessage nếu API trả về chi tiết LatestMessage */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};