import { api } from "./axios";

export const updateAvatarApi = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file); // Key phải là 'avatar' như Backend quy định

  const response = await api.post("/user/update-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};