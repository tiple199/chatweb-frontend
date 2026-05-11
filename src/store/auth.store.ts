import { create } from "zustand";

// Định nghĩa kiểu dữ liệu User đồng bộ với Backend
type User = {
  _id: string;
  fullName: string; // Đồng bộ với schema Backend
  email: string;
  avatar: string | null; // Thêm trường avatar để hiển thị ảnh
};

type AuthState = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  // Khởi tạo token từ localStorage để giữ phiên đăng nhập khi F5
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));