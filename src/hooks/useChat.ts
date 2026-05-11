import { useState, useEffect, useCallback } from "react";
import { socket } from "../lib/socket";
import { getMessages } from "../api/message.api";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../store/auth.store";

export const useChat = (conversationId: string) => {
  const { messages, setMessages, prependMessages, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMessages = useCallback(async (pageNum: number) => {
    if (!conversationId) return;
    try {
      const res = await getMessages(conversationId, pageNum);
      if (res.success) {
        if (pageNum === 1) {
          setMessages(res.messages);
        } else {
          prependMessages(res.messages);
        }
        setHasMore(res.currentPage < res.totalPages);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  }, [conversationId, setMessages, prependMessages]);

  useEffect(() => {
    if (!conversationId || !user) return;

    setPage(1);
    setHasMore(true);
    fetchMessages(1);

    socket.connect();
    socket.emit("join_room", conversationId);

    socket.on("receive_message", (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        addMessage(newMessage);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [conversationId, user, fetchMessages, addMessage]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchMessages(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  // QUAN TRỌNG: Phải return 'page' ở đây
  return { messages, loadMore, hasMore, loadingMore, user, page };
};