import { useAuthStore } from "../store/auth.store";
import type { LoginPayload, RegisterPayload } from "../api/auth.api";

export function useAuth() {
  const { setAuth, logout } = useAuthStore();

  const loginHandler = async (data: LoginPayload) => {
    // MOCK
    setAuth({
      _id: "1",
      fullName: "User Demo",
      email: data.email,
      isVerified: true,
      avatar: "",
      isOnline: true,
      lastActive: new Date().toISOString(),
      role: "user",
      isActive: true,
      createAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, "mock-token");
  };

  const registerHandler = async (data: RegisterPayload) => {
    // MOCK
    setAuth({
      _id: "1",
      fullName: data.fullName,
      email: data.email,
      isVerified: true,
      avatar: "",
      isOnline: true,
      lastActive: new Date().toISOString(),
      role: "user",
      isActive: true,
      createAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, "mock-token");
  };

  return {
    loginHandler,
    registerHandler,
    logout,
  };
}
