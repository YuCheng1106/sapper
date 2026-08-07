import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createTextBlockAPI,
    deleteTextBlockAPI,
    updateTextBlockAPI,
    queryTextBlockAll,
    queryTextBlockDetail,
    queryTextBlockList
} from '../api/sapper/textBlock';
import {TextBlockUpdateReq, TextBlockCreateReq, GetTextBlockListParam} from "../types/textBlockType";

// 获取所有插件
export const fetchAllTextBlocks = createAsyncThunk(
    'textBlock/fetchAllTextBlocks',
    async (_, { rejectWithValue }) => {
        try {
            return await queryTextBlockAll();
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all textBlocks');
        }
    }
);

// 获取插件详情
export const fetchTextBlockDetail = createAsyncThunk(
    'textBlock/fetchTextBlockDetail',
    async (textBlockId: number, { rejectWithValue }) => {
        try {
            return await queryTextBlockDetail(textBlockId);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch textBlock details');
        }
    }
);

// 获取插件列表（分页）
export const fetchTextBlockList = createAsyncThunk(
    'textBlock/fetchTextBlockList',
    async (params: GetTextBlockListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryTextBlockList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch textBlock list');
        }
    }
);


// 创建插件
export const createTextBlock = createAsyncThunk(
    'textBlock/createNewTextBlock',
    async (data: TextBlockCreateReq, { rejectWithValue }) => {
        try {
            return await createTextBlockAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create textBlock');
        }
    }
);

// 更新插件
export const updateTextBlock = createAsyncThunk(
    'textBlock/updateTextBlockInfo',
    async ({ textBlockId, data }: { textBlockId: number; data: TextBlockUpdateReq }, { rejectWithValue }) => {
        try {
            await updateTextBlockAPI(textBlockId, data);
            return {id: textBlockId, ...data}
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update textBlock');
        }
    }
);


// 批量删除插件
export const deleteTextBlock = createAsyncThunk(
    'textBlock/deleteTextBlocks',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deleteTextBlockAPI(pk);
            return pk
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete textBlocks');
        }
    }
);
