import axios from 'axios';
import {FileUploadRes} from "../types/fileType.ts";

const url = import.meta.env.VITE_RUNTIME_API_BASE_URL || 'http://localhost:8006/server/'
export function mdToPDFAPI(data: string): Promise<FileUploadRes> {
    return axios.post(`${url}api/v1/custom-plugin/markdown-2-pdf`, {"content": data});
}

export function mdToImageAPI(data: string): Promise<FileUploadRes> {
    return axios.post(`${url}api/v1/custom-plugin/markdown-2-image`, {"content": data});
}

export function mdToDocxAPI(data: string): Promise<FileUploadRes> {
    return axios.post(`${url}api/v1/custom-plugin/markdown-2-docx`, {"content": data});
}
