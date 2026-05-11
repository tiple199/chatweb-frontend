import { api } from "./axios";

export const loginApi = async (data: any) => {
  // Backend trả về: { success: true, data: { accessToken, refreshToken, user: { ... } } }
  const response = await api.post("/auth/login", data);
  return response.data;
};