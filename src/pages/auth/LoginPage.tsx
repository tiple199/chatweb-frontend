import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store'; 
import { Eye, EyeOff } from 'lucide-react';
import { notification } from 'antd';
import type { User } from '../../types/user.type';

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface LoginApiResponse {
  data: AuthResponse;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const { user, accessToken, refreshToken } = (response.data as unknown as any).data; 
      
      setAuth(user, accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      notification.success({ message: 'Thành công', description: 'Đăng nhập thành công!' });
      navigate("/");

    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        notification.error({ message: 'Lỗi đăng nhập', description: err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác.' });
      } else {
        notification.error({ message: 'Lỗi hệ thống', description: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center mesh-bg p-4 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in-up z-10">
        <div className="glass-card p-8 md:p-10 text-center">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105">
            <span className="text-3xl text-white">✨</span>
          </div>

          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-purple-800 mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-slate-500 mb-8 font-medium">Đăng nhập để tiếp tục trò chuyện</p>

          <form onSubmit={handleLogin} className="space-y-5 text-left">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-input text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="relative space-y-1.5"> {/* Thêm relative ở đây */}
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">Quên mật khẩu?</Link>
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-input text-slate-800 placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                // Điều chỉnh top-9 (hoặc giá trị phù hợp với chiều cao label) để căn giữa icon
                className="absolute right-3 top-[calc(50%+10px)] transform -translate-y-1/2 p-2 text-slate-500 hover:text-slate-600 transition-all"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <button 
              id="login-submit"
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Đăng nhập'}
            </button>
            
            <div className="text-center mt-6 text-sm text-slate-500 font-medium pt-4 border-t border-slate-100">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline underline-offset-4 transition-all">
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};