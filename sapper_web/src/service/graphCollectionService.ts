import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createGraphCollectionAPI,
    deleteGraphCollectionAPI,
    updateGraphCollectionAPI,
    queryGraphCollectionAll,
    queryGraphCollectionDetail,
    queryGraphCollectionList
} from '../api/sapper/graphCollection';
import {GraphCollectionUpdateReq, GraphCollectionCreateReq, GetGraphCollectionListParam} from "../types/graphCollectionType";

// 获取所有插件
export const fetchAllGraphCollections = createAsyncThunk(
    'graphCollection/fetchAllGraphCollections',
    async (_, { rejectWithValue }) => {
        try {
            return await queryGraphCollectionAll();
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all graphCollections');
        }
    }
);

// 获取插件详情
export const fetchGraphCollectionDetail = createAsyncThunk(
    'graphCollection/fetchGraphCollectionDetail',
    async (graphCollectionId: string, { rejectWithValue }) => {
        try {
            return await queryGraphCollectionDetail(graphCollectionId);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch graphCollection details');
        }
    }
);

// 获取插件列表（分页）
export const fetchGraphCollectionList = createAsyncThunk(
    'graphCollection/fetchGraphCollectionList',
    async (params: GetGraphCollectionListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryGraphCollectionList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch graphCollection list');
        }
    }
);


// 创建插件
export const createGraphCollection = createAsyncThunk(
    'graphCollection/createNewGraphCollection',
    async (data: GraphCollectionCreateReq, { rejectWithValue }) => {
        try {
            return await createGraphCollectionAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create graphCollection');
        }
    }
);

// 更新插件
export const updateGraphCollection = createAsyncThunk(
    'graphCollection/updateGraphCollectionInfo',
    async ({ graphCollectionId, data }: { graphCollectionId: number; data: GraphCollectionUpdateReq }, { rejectWithValue }) => {
        try {
            await updateGraphCollectionAPI(graphCollectionId, data);
            return {id: graphCollectionId, ...data}
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update graphCollection');
        }
    }
);


// 批量删除插件
export const deleteGraphCollection = createAsyncThunk(
    'graphCollection/deleteGraphCollections',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deleteGraphCollectionAPI(pk);
            return pk
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete graphCollections');
        }
    }
);
