import { updateAvatarApi } from "../api/user.api";
import { useAuthStore } from "../store/auth.store";

export const useAuth = () => {
  const { user, setUser } = useAuthStore();

  const changeAvatar = async (file: File) => {
    try {
      const res = await updateAvatarApi(file);
      if (res.success) {
        // Cập nhật lại user trong Store với URL avatar mới từ Backend
        setUser(res.data.user);
        alert("Cập nhật ảnh đại diện thành công!");
      }
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      alert("Không thể cập nhật ảnh.");
    }
  };

  return { user, changeAvatar };
};