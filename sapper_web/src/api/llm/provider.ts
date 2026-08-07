import axios from '../interceptor';
import {
    LLMProviderCreateReq,
    LLMProviderDetail,
    LLMProviderPagination,
    LLMProviderRes,
    LLMProviderUpdateReq,
    GetLLMProviderListParam,
    LLMConfigValidation
} from "../../types/llmProviderType";

// 获取提供商详情（带关联模型）
export function queryLlmProviderDetail(pk: number): Promise<LLMProviderDetail> {
    return axios.get(`/api/v1/llm/providers/${pk}`);
}

export function queryLlmProviderList(params?: GetLLMProviderListParam): Promise<LLMProviderPagination> {
    return axios.get('/api/v1/llm/providers', {
        params: {
            ...params,
            // 统一分页参数命名
            page: params?.page || 1,
            size: params?.size || 30
        }
    });
}

// 创建提供商
export function createLlmProviderAPI(data: LLMProviderCreateReq): Promise<LLMProviderRes> {
    return axios.post('/api/v1/llm/providers', data);
}

// 更新提供商信息
export function updateLlmProviderAPI(pk: number, data: LLMProviderUpdateReq): Promise<LLMProviderRes> {
    return axios.put(`/api/v1/llm/providers/${pk}`, data);
}

// 删除提供商
export function deleteLlmProviderAPI(pk: number): Promise<void> {
    return axios.delete(`/api/v1/llm/providers/${pk}`);
}

// 设置提供商状态
export function setLlmProviderStatusAPI(pk: number, status: number): Promise<void> {
    return axios.patch(`/api/v1/llm/providers/${pk}/status`, { status });
}

// 验证用户LLM配置
export function validateLlmProvider(): Promise<LLMConfigValidation> {
    return axios.get(`/api/v1/llm/providers/config/validate`);
}
