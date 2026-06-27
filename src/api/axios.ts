import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { API_BASE_URL } from "../lib/env";

// Đảm bảo có từ khóa export ở đây
export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});