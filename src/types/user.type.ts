export interface User {
  _id: string;
  fullName: string;    // ✅ Đã đổi từ name -> fullName
  email: string;
  avatar: string | null; // ✅ Hỗ trợ null từ Backend
}