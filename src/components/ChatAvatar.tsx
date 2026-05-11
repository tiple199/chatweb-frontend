import { useState } from "react";
import { normalizeAvatarUrl, getInitials } from "../lib/utils";

interface Props {
  avatarUrl?: string | null;
  fullName: string;
  size?: number;
}

export const ChatAvatar = ({ avatarUrl, fullName, size = 40 }: Props) => {
  const [isError, setIsError] = useState(false);

  // 1. Lấy initials từ tên (ví dụ: "Nguyễn Văn Tùng" -> "NT")
  const initials = getInitials(fullName);

  /**
   * 2. Logic tạo màu nền cố định theo tên giống Telegram.
   * Cùng một cái tên sẽ luôn ra một màu nhất định.
   */
  const getTelegramColor = (name: string) => {
    const colors = [
      "#2196f3", // Blue
      "#32c45e", // Green
      "#ff4444", // Red
      "#ffbb33", // Orange
      "#aa66cc", // Purple
      "#0099cc", // Cyan
      "#ff6b6b", // Red 2
      "#4ecdc4", // Teal
    ];
    // Thuật toán băm đơn giản để chọn màu dựa trên mã ký tự của tên
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const bgColor = getTelegramColor(fullName || "");
  const normalizedUrl = normalizeAvatarUrl(avatarUrl);

  // 3. Nếu không có ảnh hoặc ảnh bị lỗi đường dẫn -> Hiện initials
  if (!normalizedUrl || isError) {
    return (
      <div
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: bgColor,
          fontSize: size * 0.5 // Fix: scale chữ đúng (50% không phải 40%)
        }}
        className="flex items-center justify-center rounded-full text-white font-bold shadow-sm shrink-0"
      >
        {initials}
      </div>
    );
  }

  // 4. Nếu có ảnh và ảnh load thành công
  return (
    <img
      src={normalizedUrl}
      alt={fullName}
      style={{ width: size, height: size }}
      className="rounded-full object-cover shadow-sm shrink-0"
      onError={() => {
        // Khi link ảnh bị lỗi (404, chết link), state này sẽ kích hoạt render lại về dạng chữ
        setIsError(true);
      }}
    />
  );
};