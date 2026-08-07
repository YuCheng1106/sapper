import axios from '../interceptor';
import {
    LLMModelCreateReq,
    LLMModelDetail,
    LLMModelPagination,
    LLMModelRes,
    LLMModelUpdateReq,
    GetLLMModelListParam
} from "../../types/llmModelType";

// 获取所有模型（非分页）
export function queryLlmModelAll(): Promise<LLMModelPagination> {
    return axios.get('/api/v1/llm/models/all');
}

// 获取模型详情（带关联模型）
export function queryLlmModelDetail(pk: number): Promise<LLMModelDetail> {
    return axios.get(`/api/v1/llm/models/${pk}`);
}

// 获取模型列表（分页+过滤）
export function queryLlmModelList(params?: GetLLMModelListParam): Promise<LLMModelPagination> {
    return axios.get('/api/v1/llm/models', {
        params: {
            ...params,
            // 统一分页参数命名
            page: params?.page || 1,
            size: params?.size || 20
        }
    });
}

// 创建模型
export function createLlmModelAPI(data: LLMModelCreateReq): Promise<LLMModelRes> {
    return axios.post('/api/v1/llm/models', data);
}

// 更新模型信息
export function updateLlmModelAPI(pk: number, data: LLMModelUpdateReq): Promise<LLMModelRes> {
    return axios.put(`/api/v1/llm/models/${pk}`, data);
}

// 删除模型
export function deleteLlmModelAPI(pk: number): Promise<void> {
    return axios.delete(`/api/v1/llm/models/${pk}`);
}

// 设置模型状态
export function setLlmModelStatusAPI(pk: number, status: number): Promise<void> {
    return axios.patch(`/api/v1/llm/models/${pk}/status`, { status });
}
