import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { socket as chatSocket, setSocketAuthToken } from '../lib/socket';
import { useAuthStore } from '../store/auth.store';
import type { Message } from '../types/message.type';
import type { BackendMessage } from '../lib/messageMapper';

export interface ParticipantUpdateData {
  ConversationId: string;
  UserId: string;
  Action: 'add' | 'remove' | 'leave';
  Role?: string;
}

export interface UseSocketReturn {
  socket: Socket | null;
  sendRealtimeMessage: (message: Message) => void;
  onMessageReceived: (callback: (msg: BackendMessage) => void) => void;
  onTyping: (callback: (payload: { roomId: string; fromSocketId: string }) => void) => void;
  onStopTyping: (callback: (payload: { roomId: string; fromSocketId: string }) => void) => void;
  onParticipantsUpdated: (callback: (data: ParticipantUpdateData) => void) => void;
}

export const useSocket = (activeConversationId?: string): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    setSocketAuthToken(localStorage.getItem('token'));
    socketRef.current = chatSocket;

    const handleConnect = () => {
      setSocket(chatSocket);
    };

    chatSocket.on('connect', handleConnect);

    if (!chatSocket.connected) {
      chatSocket.connect();
    } else {
      setSocket(chatSocket);
    } 

    return () => {
      chatSocket.off('connect', handleConnect);
      socketRef.current = null;
      setSocket(null); 
    };
  }, [user]);

  useEffect(() => {
    if (socket && activeConversationId) {
      socket.emit('join_room', { roomId: activeConversationId });
    }
  }, [socket, activeConversationId]);

  const sendRealtimeMessage = useCallback((message: Message) => {
    socketRef.current?.emit('send_message', {
      conversationId: message.ConversationId,
      content: message.Content,
      type: message.MessageType,
    });
  }, []);

  const onMessageReceived = useCallback((callback: (msg: BackendMessage) => void) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    currentSocket.off('receive_message'); 
    currentSocket.on('receive_message', callback);
  }, []);

  const onTyping = useCallback((callback: (payload: { roomId: string; fromSocketId: string }) => void) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    currentSocket.off('typing');
    currentSocket.on('typing', callback);
  }, []);

  const onStopTyping = useCallback((callback: (payload: { roomId: string; fromSocketId: string }) => void) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    currentSocket.off('stop_typing');
    currentSocket.on('stop_typing', callback);
  }, []);

  const onParticipantsUpdated = useCallback((callback: (data: ParticipantUpdateData) => void) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    currentSocket.off('participants_updated');
    currentSocket.on('participants_updated', callback);
  }, []);

  return {
    socket,
    sendRealtimeMessage,
    onMessageReceived,
    onTyping,
    onStopTyping,
    onParticipantsUpdated
  };
};