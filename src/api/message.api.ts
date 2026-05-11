import { api } from "./axios";

export const getMessages = async (conversationId: string, page: number = 1) => {
  // Gửi request kèm tham số page và limit
  const response = await api.get(`/messages/${conversationId}?page=${page}&limit=20`);
  
  /**
   * Cấu trúc response data trả về: 
   * { success: true, messages: [], currentPage: 1, totalPages: 5 }
   */
  return response.data;
};