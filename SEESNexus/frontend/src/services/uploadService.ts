import api from "../api/axios";

export interface UploadImageResult {
  url: string;
  public_id: string;
}

const uploadService = {
  uploadImage: async (file: File): Promise<UploadImageResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data as UploadImageResult;
  },
};

export default uploadService;
