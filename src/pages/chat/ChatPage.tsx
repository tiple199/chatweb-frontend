import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Sidebar } from '../../components/chat/Sidebar';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { ChatHeader } from '../../components/chat/ChatHeader';
import type { Conversation } from '../../types/conversation.type';
import { conversationApi } from '../../api/conversation.api';
import { AddMemberModal } from '../../components/chat/modals/AddMemberModal';
import { NotesModal } from '../../components/chat/modals/NotesModal';
import { PollsModal } from '../../components/chat/modals/PollsModal';
import { UserProfileView } from '../../components/chat/UserProfileView';
import { ChatInfoDrawer } from '../../components/chat/ChatInfoDrawer';
import { MessageSearch } from '../../components/chat/MessageSearch';
import type { User } from '../../types/user.type';
import { mapBackendConversations } from '../../lib/conversationMapper';

export const ChatPage: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isPollsOpen, setIsPollsOpen] = useState(false);
  
  // Custom Drawers / Popups
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // Stranger Profile state
  const [selectedStranger, setSelectedStranger] = useState<User | null>(null);
  const [strangerChatUser, setStrangerChatUser] = useState<User | null>(null);

  const loadConversations = async () => {
    try {
      const res = await conversationApi.getConversations();
      const rawData = (res.data as any).data || res.data || [];
      const convs = mapBackendConversations(rawData);
      setConversations(convs);
      return convs;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || err.message;
        console.error('Lỗi khi tải danh sách cuộc trò chuyện:', message);
      }
      return [] as Conversation[];
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setSelectedStranger(null); // Tắt profile người lạ khi chọn chat
    setStrangerChatUser(null);

    let currentConversation = conversations.find((c) => c.ConversationId === id);
    if (!currentConversation) {
      const convs = await loadConversations();
      currentConversation = convs.find((c) => c.ConversationId === id);
    }

    setActiveConversation(currentConversation || null);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Sidebar 
        activeConversationId={activeConversationId} 
        onSelectConversation={handleSelectConversation}
        onSelectStranger={(user) => {
          setSelectedStranger(user);
          setStrangerChatUser(null);
          setActiveConversationId(undefined); // Tắt chat hiện tại
          setActiveConversation(null);
        }}
      />

      <div className="flex-1 flex flex-col relative bg-slate-50">
        <ChatHeader 
          conversation={activeConversation} 
          strangerUser={selectedStranger || strangerChatUser}
          onOpenAddMember={() => setIsAddMemberOpen(true)}
          onOpenNotes={() => setIsNotesOpen(true)}
          onOpenPolls={() => setIsPollsOpen(true)}
          onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
          onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
          isSearchOpen={isSearchOpen}
          isInfoOpen={isInfoOpen}
        />
        
        {isSearchOpen && activeConversationId && (
          <div className="absolute top-16 right-0 z-30 mr-4 mt-2">
            <MessageSearch conversationId={activeConversationId} onClose={() => setIsSearchOpen(false)} />
          </div>
        )}

        {selectedStranger ? (
          <UserProfileView 
            user={selectedStranger} 
            onClose={() => setSelectedStranger(null)}
            onStartChat={(convId) => {
              setStrangerChatUser(selectedStranger);
              setSelectedStranger(null);
              setActiveConversationId(convId);
            }} 
          />
        ) : activeConversationId ? (
          <div className="flex-1 overflow-hidden relative flex">
            <div className="flex-1 relative">
              <ChatWindow conversationId={activeConversationId} />
            </div>
            {isInfoOpen && (
              <ChatInfoDrawer conversationId={activeConversationId} onClose={() => setIsInfoOpen(false)} />
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-multiply pointer-events-none"></div>
            <div className="w-24 h-24 bg-white shadow-xl shadow-blue-500/10 rounded-full flex items-center justify-center mb-6 relative z-10">
              <span className="text-5xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Chào mừng bạn trở lại</h2>
            <p className="text-slate-500 mb-8 relative z-10 font-medium">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
          </div>
        )}

        {/* Modals */}
        {isAddMemberOpen && activeConversationId && (
          <AddMemberModal 
            conversationId={activeConversationId} 
            onClose={() => setIsAddMemberOpen(false)} 
          />
        )}
        {isNotesOpen && activeConversationId && (
          <NotesModal 
            conversationId={activeConversationId} 
            onClose={() => setIsNotesOpen(false)} 
          />
        )}
        {isPollsOpen && activeConversationId && (
          <PollsModal 
            conversationId={activeConversationId} 
            onClose={() => setIsPollsOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};