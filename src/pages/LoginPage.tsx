import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { loginApi } from "../api/auth.api";
import { useState } from "react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (formData: any) => {
    setLoading(true);
    try {
      const res = await loginApi(formData);

      if (res.success) {
        // 1. Lưu token vào localStorage và Store
        setToken(res.data.accessToken);

        // 2. Lưu thông tin user (đã có fullName, avatar) vào Store
        setUser(res.data.user);

        // 3. Điều hướng vào trang chat chính
        navigate("/chat");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX của form đăng nhập gọi handleLogin khi submit
    <div>Form Login của bạn</div>
  );
};