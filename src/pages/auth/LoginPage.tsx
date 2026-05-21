import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store'; 
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
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, password });
      const { user, accessToken } = (response.data as unknown as LoginApiResponse).data; 
      
      setAuth(user, accessToken);
      navigate("/");

    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
      } else {
        setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleLogin} className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
        </div>

        <h1 className="auth-title">Chào mừng trở lại</h1>
        <p className="auth-subtitle">Đăng nhập để tiếp tục trò chuyện</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Mật khẩu</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
        </div>
        
        <button 
          id="login-submit"
          type="submit" 
          disabled={isLoading}
          className="auth-btn-primary"
        >
          {isLoading ? (
            <span className="auth-loading-dots">
              <span /><span /><span />
            </span>
          ) : 'Đăng nhập'}
        </button>
        
        <div className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </form>
    </div>
  );
};