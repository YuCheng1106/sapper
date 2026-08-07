import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createPluginAPI,
    deletePluginAPI,
    updatePluginAPI,
    queryPluginAll,
    queryPluginDetail,
    queryPluginList, queryPublicPluginList
} from '../api/sapper/plugin';
import {PluginUpdateReq, PluginCreateReq, GetPluginListParam} from "../types/pluginType";

// 获取所有插件
export const fetchAllPlugins = createAsyncThunk(
    'plugin/fetchAllPlugins',
    async (_, { rejectWithValue }) => {
        try {
            return await queryPluginAll();
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all plugins');
        }
    }
);

// 获取插件详情
export const fetchPluginDetail = createAsyncThunk(
    'plugin/fetchPluginDetail',
    async (pluginUuid: string, { rejectWithValue }) => {
        try {
            return await queryPluginDetail(pluginUuid);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch plugin details');
        }
    }
);

// 获取所有公开插件
export const fetchPublicPluginList = createAsyncThunk(
    'agent/fetchPublicPluginList',
    async (params: GetPluginListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryPublicPluginList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all plugins');
        }
    }
);

// 获取插件列表（分页）
export const fetchPluginList = createAsyncThunk(
    'plugin/fetchPluginList',
    async (params: GetPluginListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryPluginList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch plugin list');
        }
    }
);


// 创建插件
export const createPlugin = createAsyncThunk(
    'plugin/createNewPlugin',
    async (data: PluginCreateReq, { rejectWithValue }) => {
        try {
            return await createPluginAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create plugin');
        }
    }
);

// 更新插件
export const updatePlugin = createAsyncThunk(
    'plugin/updatePluginInfo',
    async ({ pluginUuid, data }: { pluginUuid: string; data: PluginUpdateReq }, { rejectWithValue }) => {
        try {
            return await updatePluginAPI(pluginUuid, data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update plugin');
        }
    }
);


// 批量删除插件
export const deletePlugin = createAsyncThunk(
    'plugin/deletePlugins',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deletePluginAPI(pk);
            return pk
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete plugins');
        }
    }
);
