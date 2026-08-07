import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createAgentPublishmentAPI,
    deleteAgentPublishmentAPI,
    updateAgentPublishmentAPI,
    queryAgentPublishmentAll,
    queryAgentPublishmentDetail,
    queryAgentPublishmentList
} from '../api/sapper/publish';
import {AgentPublishmentUpdateReq, AgentPublishmentCreateReq, GetAgentPublishmentListParam} from "../types/publishType";

// 获取所有插件
export const fetchAllAgentPublishments = createAsyncThunk(
    'publish/fetchAllAgentPublishments',
    async (_, { rejectWithValue }) => {
        try {
            return await queryAgentPublishmentAll();
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all publishs');
        }
    }
);

// 获取插件详情
export const fetchAgentPublishmentDetail = createAsyncThunk(
    'publish/fetchAgentPublishmentDetail',
    async (publishUuid: string, { rejectWithValue }) => {
        try {
            return await queryAgentPublishmentDetail(publishUuid);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch publish details');
        }
    }
);

// 获取插件列表（分页）
export const fetchAgentPublishmentList = createAsyncThunk(
    'publish/fetchAgentPublishmentList',
    async (params: GetAgentPublishmentListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryAgentPublishmentList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch publish list');
        }
    }
);


// 创建插件
export const createAgentPublishment = createAsyncThunk(
    'publish/createNewAgentPublishment',
    async (data: AgentPublishmentCreateReq, { rejectWithValue }) => {
        try {
            return await createAgentPublishmentAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create publish');
        }
    }
);

// 更新插件
export const updateAgentPublishment = createAsyncThunk(
    'publish/updateAgentPublishmentInfo',
    async ({ publishUuid, data }: { publishUuid: string; data: AgentPublishmentUpdateReq }, { rejectWithValue }) => {
        try {
            await updateAgentPublishmentAPI(publishUuid, data);
            return {uuid: publishUuid, ...data}
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update publish');
        }
    }
);


// 批量删除插件
export const deleteAgentPublishment = createAsyncThunk(
    'publish/deleteAgentPublishments',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deleteAgentPublishmentAPI(pk);
            return pk
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete publishs');
        }
    }
);
