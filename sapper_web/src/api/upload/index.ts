import axios from '../interceptor';
import { FileUploadRes } from "../../types/fileType";

export async function uploadFile(fileData: string | Blob ): Promise<FileUploadRes> {
    const formData = new FormData();
    formData.append('file', fileData);

    // 发送请求
    return axios.post('/api/v1/sapper/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
}
