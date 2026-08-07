import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    createLlmModelAPI,
    deleteLlmModelAPI,
    updateLlmModelAPI,
    queryLlmModelAll,
    queryLlmModelDetail,
    queryLlmModelList,
    setLlmModelStatusAPI
} from '../api/llm/model';
import type {
    LLMModelCreateReq,
    LLMModelUpdateReq,
    GetLLMModelListParam
} from '../types/llmModelType';

// 获取所有模型（非分页）
export const fetchAllLLMModels = createAsyncThunk(
    'llmModel/fetchAllModels',
    async (_, { rejectWithValue }) => {
        try {
            return await queryLlmModelAll();
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('获取模型列表失败');
        }
    }
);

// 获取模型详情
export const fetchLLMModelDetail = createAsyncThunk(
    'llmModel/fetchModelDetail',
    async (pk: number, { rejectWithValue }) => {
        try {
            return await queryLlmModelDetail(pk);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('获取模型详情失败');
        }
    }
);

// 获取分页列表
export const fetchLLMModelList = createAsyncThunk(
    'llmModel/fetchModelList',
    async (params: GetLLMModelListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryLlmModelList(params);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('获取分页列表失败');
        }
    }
);

// 创建模型
export const createLLMModel = createAsyncThunk(
    'llmModel/createNewModel',
    async (data: LLMModelCreateReq, { rejectWithValue }) => {
        try {
            return await createLlmModelAPI(data);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('创建模型失败');
        }
    }
);

// 更新模型
export const updateLLMModel = createAsyncThunk(
    'llmModel/updateModelInfo',
    async (
        { pk, data }: { pk: number; data: LLMModelUpdateReq },
        { rejectWithValue }
    ) => {
        try {
            return await updateLlmModelAPI(pk, data);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('更新模型信息失败');
        }
    }
);

// 删除模型
export const deleteLLMModel = createAsyncThunk(
    'llmModel/deleteModels',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deleteLlmModelAPI(pk);
            return pk; // 返回被删除的UUID用于更新状态
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown } };
            if (axiosError.response?.data) {
                return rejectWithValue(axiosError.response.data);
            }
            return rejectWithValue('删除模型失败');
        }
    }
);

// 设置模型状态
export const setLLMModelStatus = createAsyncThunk(
    'llmModel/setModelStatus',
    async (
        { pk, status }: { pk: number; status: number },
        { rejectWithValue }
    ) => {
        try {
            await setLlmModelStatusAPI(pk, status);
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
