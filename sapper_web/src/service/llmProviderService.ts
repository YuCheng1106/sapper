import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    createLlmProviderAPI,
    deleteLlmProviderAPI,
    updateLlmProviderAPI,
    queryLlmProviderDetail,
    queryLlmProviderList,
    setLlmProviderStatusAPI
} from '../api/llm/provider';
import type {
    LLMProviderCreateReq,
    LLMProviderUpdateReq,
    GetLLMProviderListParam
} from '../types/llmProviderType';

// 获取提供商详情
export const fetchLLMProviderDetail = createAsyncThunk(
    'llmProvider/fetchProviderDetail',
    async (providerId: number, { rejectWithValue }) => {
        try {
            return await queryLlmProviderDetail(providerId);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('获取提供商详情失败');
        }
    }
);

// 获取分页列表
export const fetchLLMProviderList = createAsyncThunk(
    'llmProvider/fetchProviderList',
    async (params: GetLLMProviderListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryLlmProviderList(params);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('获取分页列表失败');
        }
    }
);

// 创建提供商
export const createLLMProvider = createAsyncThunk(
    'llmProvider/createNewProvider',
    async (data: LLMProviderCreateReq, { rejectWithValue }) => {
        try {
            return await createLlmProviderAPI(data);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('创建提供商失败');
        }
    }
);

// 更新提供商
export const updateLLMProvider = createAsyncThunk(
    'llmProvider/updateProviderInfo',
    async (
        { providerId, data }: { providerId: number; data: LLMProviderUpdateReq },
        { rejectWithValue }
    ) => {
        try {
            return await updateLlmProviderAPI(providerId, data);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('更新提供商信息失败');
        }
    }
);

// 删除提供商
export const deleteLLMProvider = createAsyncThunk(
    'llmProvider/deleteProviders',
    async (providerId: number, { rejectWithValue }) => {
        try {
            await deleteLlmProviderAPI(providerId);
            return providerId; // 返回被删除的UUID用于更新状态
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('删除提供商失败');
        }
    }
);

// 设置提供商状态
export const setLLMProviderStatus = createAsyncThunk(
    'llmProvider/setProviderStatus',
    async (
        { pk, status }: { pk: number; status: number },
        { rejectWithValue }
    ) => {
        try {
            await setLlmProviderStatusAPI(pk, status);
            return { pk, status };
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('状态更新失败');
        }
    }
);