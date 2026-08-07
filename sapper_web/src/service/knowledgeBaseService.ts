import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createKnowledgeBaseAPI,
    deleteKnowledgeBaseAPI,
    updateKnowledgeBaseAPI,
    queryKnowledgeBaseAll,
    queryKnowledgeBaseDetail,
    queryKnowledgeBaseList
} from '../api/sapper/knowledgeBase';
import {KnowledgeBaseUpdateReq, KnowledgeBaseCreateReq, GetKnowledgeBaseListParam} from "../types/knowledgeBaseType";

// 获取所有插件
export const fetchAllKnowledgeBases = createAsyncThunk(
    'knowledgeBase/fetchAllKnowledgeBases',
    async (_, { rejectWithValue }) => {
        try {
            return await queryKnowledgeBaseAll();
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all knowledgeBases');
        }
    }
);

// 获取插件详情
export const fetchKnowledgeBaseDetail = createAsyncThunk(
    'knowledgeBase/fetchKnowledgeBaseDetail',
    async (knowledgeBaseUuid: string, { rejectWithValue }) => {
        try {
            return await queryKnowledgeBaseDetail(knowledgeBaseUuid);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch knowledgeBase details');
        }
    }
);

// 获取插件列表（分页）
export const fetchKnowledgeBaseList = createAsyncThunk(
    'knowledgeBase/fetchKnowledgeBaseList',
    async (params: GetKnowledgeBaseListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryKnowledgeBaseList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch knowledgeBase list');
        }
    }
);


// 创建插件
export const createKnowledgeBase = createAsyncThunk(
    'knowledgeBase/createNewKnowledgeBase',
    async (data: KnowledgeBaseCreateReq, { rejectWithValue }) => {
        try {
            return await createKnowledgeBaseAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create knowledgeBase');
        }
    }
);

// 更新插件
export const updateKnowledgeBase = createAsyncThunk(
    'knowledgeBase/updateKnowledgeBaseInfo',
    async ({ knowledgeBaseUuid, data }: { knowledgeBaseUuid: string; data: KnowledgeBaseUpdateReq }, { rejectWithValue }) => {
        try {
            await updateKnowledgeBaseAPI(knowledgeBaseUuid, data);
            return {uuid: knowledgeBaseUuid, ...data}
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update knowledgeBase');
        }
    }
);


// 批量删除插件
export const deleteKnowledgeBase = createAsyncThunk(
    'knowledgeBase/deleteKnowledgeBases',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deleteKnowledgeBaseAPI(pk);
            return pk
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete knowledgeBases');
        }
    }
);
