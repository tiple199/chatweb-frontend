import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authApi } from '../../api/auth.api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', otp: ''
  });
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Vui lòng nhập email trước!');
      return;
    }
    setError('');
    try {
      await authApi.sendOtp({ email: formData.email });
      setIsOtpSent(true);
      alert('Mã OTP đã được gửi đến email của bạn!');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Lỗi khi gửi OTP');
      } else {
        setError('Lỗi không xác định khi gửi OTP');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      await authApi.register(formData);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Đăng ký thất bại!');
      } else {
        setError('Lỗi không xác định khi đăng ký.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleRegister} className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">✨</div>
        </div>

        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-subtitle">Tham gia và bắt đầu trò chuyện ngay hôm nay</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label className="auth-label">Họ và tên</label>
          <input
            id="register-fullname"
            name="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            className="auth-input"
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <div className="auth-input-group">
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="auth-input"
              onChange={handleChange}
              required
            />
            <button
              id="register-send-otp"
              type="button"
              onClick={handleSendOtp}
              className="auth-btn-otp"
            >
              {isOtpSent ? 'Gửi lại' : 'Gửi OTP'}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">Mã OTP</label>
          <input
            id="register-otp"
            name="otp"
            type="text"
            placeholder="Nhập mã 6 chữ số"
            className="auth-input"
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Mật khẩu</label>
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            className="auth-input"
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Xác nhận mật khẩu</label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            className="auth-input"
            onChange={handleChange}
            required
          />
        </div>
        
        <button
          id="register-submit"
          type="submit"
          className="auth-btn-primary"
        >
          Tạo tài khoản
        </button>
        
        <div className="auth-footer">
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
};