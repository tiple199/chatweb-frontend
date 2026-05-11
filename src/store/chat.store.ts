import { create } from "zustand";

interface ChatState {
  messages: any[];
  setMessages: (messages: any[]) => void;
  prependMessages: (oldMessages: any[]) => void; 
  addMessage: (message: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  
  // Nối tin nhắn cũ vào phía trước mảng hiện tại
  prependMessages: (oldMessages) => 
    set((state) => ({ messages: [...oldMessages, ...state.messages] })),

  addMessage: (message) =>
    set((state) => ({ 
      // Kiểm tra tránh trùng lặp tin nhắn nếu socket gửi về tin vừa tạo
      messages: state.messages.some(m => m._id === message._id) 
        ? state.messages 
        : [...state.messages, message] 
    })),
}));