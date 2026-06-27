export interface User {
  _id: string;
  fullName: string;
  email: string;
  // Bỏ qua PasswordHash ở Frontend vì lý do bảo mật

  isVerified: boolean;
  avatar: string;
  isOnline: boolean;
  lastActive: string; // datetime (ISO string)
  role: string; // enum
  isActive: boolean;
  createAt: string;
  updatedAt: string;
} 