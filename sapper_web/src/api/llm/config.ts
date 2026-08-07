import axios from '../interceptor';

// LLM配置相关类型定义
export interface LLMConfig {
    api_key: string;
    api_url: string;
    provider_name: string;
    provider_uuid: string;
}

export interface LLMConfigValidation {
    is_valid: boolean;
}

// 获取用户LLM配置
export function getUserLLMConfig(): Promise<LLMConfig> {
    return axios.get('/api/v1/llm/config/user-config');
}

// 验证用户LLM配置
export function validateUserLLMConfig(): Promise<LLMConfigValidation> {
    return axios.get('/api/v1/llm/config/validate');
}
