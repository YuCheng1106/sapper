import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createCollectionAPI,
    deleteCollectionAPI,
    updateCollectionAPI,
    queryCollectionAll,
    queryCollectionDetail,
    queryCollectionList
} from '../api/sapper/collection';
import {CollectionUpdateReq, CollectionCreateReq, GetCollectionListParam} from "../types/collectionType";

// 获取所有插件
export const fetchAllCollections = createAsyncThunk(
    'collection/fetchAllCollections',
    async (_, { rejectWithValue }) => {
        try {
            return await queryCollectionAll();
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all collections');
        }
    }
);

// 获取插件详情
export const fetchCollectionDetail = createAsyncThunk(
    'collection/fetchCollectionDetail',
    async (collectionId: number, { rejectWithValue }) => {
        try {
            return await queryCollectionDetail(collectionId);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch collection details');
        }
    }
);

// 获取插件列表（分页）
export const fetchCollectionList = createAsyncThunk(
    'collection/fetchCollectionList',
    async (params: GetCollectionListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryCollectionList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch collection list');
        }
    }
);


// 创建插件
export const createCollection = createAsyncThunk(
    'collection/createNewCollection',
    async (data: CollectionCreateReq, { rejectWithValue }) => {
        try {
            return await createCollectionAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create collection');
        }
    }
);

// 更新插件
export const updateCollection = createAsyncThunk(
    'collection/updateCollectionInfo',
    async ({ collectionId, data }: { collectionId: number; data: CollectionUpdateReq }, { rejectWithValue }) => {
        try {
            await updateCollectionAPI(collectionId, data);
            return {id: collectionId, ...data}
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update collection');
        }
    }
);


// 批量删除插件
export const deleteCollection = createAsyncThunk(
    'collection/deleteCollections',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deleteCollectionAPI(pk);
            return pk
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete collections');
        }
    }
);
