import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createAgentAPI,
    deleteAgentAPI,
    updateAgentAPI,
    queryAgentAll,
    queryAgentDetail,
    queryAgentList,
    generateSplFormStream,
    generateSplChainStream,
    resetAgentPluginAPI,
    resetAgentKnowledgeBaseAPI,
    downloadAgentAPI,
    queryPublicAgentList,
    setAgentFavoriteAPI,
    setAgentRatingAPI,
    queryAgentWorkspaceDetail,
} from '../api/sapper/agent';
import {AgentUpdateReq, AgentCreateReq, GetAgentListParam} from "../types/agentType";
import {PluginDetail} from "../types/pluginType";
import {KnowledgeBaseRes} from "../types/knowledgeBaseType";

// 获取所有智能体
export const fetchAllAgents = createAsyncThunk(
    'agent/fetchAllAgents',
    async (_, { rejectWithValue }) => {
        try {
            return await queryAgentAll();
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all agents');
        }
    }
);

// 获取所有公开智能体
export const fetchPublicAgentList = createAsyncThunk(
    'agent/fetchPublicAgentList',
    async (params: GetAgentListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryPublicAgentList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all agents');
        }
    }
);

// 获取智能体详情
export const fetchAgentDetail = createAsyncThunk(
    'agent/fetchAgentDetail',
    async (agentUuid: string, { rejectWithValue }) => {
        try {
            return await queryAgentDetail(agentUuid);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch agent details');
        }
    }
);

export const fetchAgentWorkspaceDetail = createAsyncThunk(
    'agent/fetchAgentDetail',
    async (agentUuid: string, { rejectWithValue }) => {
        try {
            return await queryAgentWorkspaceDetail(agentUuid);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch agent details');
        }
    }
);

// 获取智能体列表（分页）
export const fetchAgentList = createAsyncThunk(
    'agent/fetchAgentList',
    async (params: GetAgentListParam | undefined, { rejectWithValue }) => {
        try {
            return await queryAgentList(params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch agent list');
        }
    }
);


// 创建智能体
export const createAgent = createAsyncThunk(
    'agent/createNewAgent',
    async (data: AgentCreateReq, { rejectWithValue }) => {
        try {
            return await createAgentAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create agent');
        }
    }
);

// 更新智能体
export const updateAgent = createAsyncThunk(
    'agent/updateAgentInfo',
    async ({ agentUuid, data }: { agentUuid: string; data: AgentUpdateReq }, { rejectWithValue }) => {
        try {
            return await updateAgentAPI(agentUuid, data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update agent');
        }
    }
);


// 收藏智能体
export const favoriteAgent = createAsyncThunk(
    'agent/favoriteAgent',
    async ({ agentUuid, favorite }: { agentUuid: string; favorite: boolean }, { rejectWithValue }) => {
        try {
            return await setAgentFavoriteAPI(agentUuid, favorite);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('收藏失败');
        }
    }
);


// 收藏智能体
export const ratingAgent = createAsyncThunk(
    'agent/ratingAgent',
    async ({ agentUuid, rating_value }: { agentUuid: string; rating_value: number }, { rejectWithValue }) => {
        try {
            await setAgentRatingAPI(agentUuid, rating_value);
            return rating_value
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('收藏失败');
        }
    }
);

// 使用 createAsyncThunk 来处理异步下载任务
export const downloadAgent = createAsyncThunk(
    'agent/downloadAgentInfo',
    async (agentUuid: string, { rejectWithValue }) => {
        try {
            // 调用 API 获取 Response 对象
            const response = await downloadAgentAPI(agentUuid);
            // 检查响应是否成功
            if (!response.ok) {
                return rejectWithValue(`Network error: ${response.statusText}`);
            }
            // 获取 Blob 数据
            const blob = await response.blob();
            // 创建 URL 对象并下载文件
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "agent_data.json";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: unknown) {
            console.error('Error while downloading agent:', error);
            return rejectWithValue('Failed to download agent');
        }
    }
);

// 智能体重置插件
export const resetAgentPlugins = createAsyncThunk(
    'agent/resetAgentPlugins',
    async ({ agentUuid, data }: { agentUuid: string; data: PluginDetail[] }, { rejectWithValue }) => {
        try {
            // 使用 map 获取所有插件的 uuid
            const pluginUuids = data.map((plugin) => plugin.uuid);

            // 调用重置插件的 API，传递 agentUuid 和 pluginUuids
            await resetAgentPluginAPI(agentUuid, {plugin_uuids: pluginUuids});

            // 返回插件数据
            return data;
        } catch (error: unknown) {
            // 错误处理
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to reset agent plugins');
        }
    }
);

// 智能体重置插件
export const resetAgentKnowledgeBases = createAsyncThunk(
    'agent/resetAgentKnowledgeBases',
    async ({ agentUuid, data }: { agentUuid: string; data: KnowledgeBaseRes[] }, { rejectWithValue }) => {
        try {
            // 使用 map 获取所有插件的 uuid
            const knowledgeBaseUuids = data.map((knowledge) => knowledge.uuid);

            // 调用重置知识库的 API，传递 agentUuid 和 pluginUuids
            await resetAgentKnowledgeBaseAPI(agentUuid, {knowledge_base_uuids: knowledgeBaseUuids});

            // 返回插件数据
            return data;
        } catch (error: unknown) {
            // 错误处理
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to reset agent plugins');
        }
    }
);

// 批量删除智能体
export const deleteAgent = createAsyncThunk(
    'agent/deleteAgents',
    async (pk: number, { rejectWithValue }) => {
        try {
            await deleteAgentAPI(pk);
            return pk
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete agents');
        }
    }
);


// 批量删除智能体
export const generateSplForm = createAsyncThunk(
    'agent/generateSplForm',
    async (uuid: string, { dispatch, rejectWithValue }) => {
        try {
            const response = await generateSplFormStream(uuid);
            if (!response?.body) {
                return rejectWithValue('Response body is null');
            }
            // 获取读取流
            const reader = response.body.getReader();
            const textDecoder = new TextDecoder("utf-8");  // 用于解码字节为字符串

            // 按块读取流数据
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;  // 如果流结束，退出循环

                // 将块数据解码为字符串，并拼接
                const chunk = textDecoder.decode(value, { stream: true });
                const chunk_list = chunk.split('\n\n')
                for (const chunk_part of chunk_list) {
                    if (chunk_part.startsWith('data:')){
                        const data = chunk_part.replace('data:', '');
                        dispatch({
                            type: 'agent/generateSplFormMessage',
                            payload: JSON.parse(data),
                        });
                    }
                }
            }
            console.log('Stream completed');
        } catch (error) {
            console.error('Error in WebSocket connection: ', error);
            return rejectWithValue('Failed to create WebSocket connection');
        }
    }
);


export const generateSplChain = createAsyncThunk(
    'agent/generateSplForm',
    async (uuid: string, { dispatch, rejectWithValue }) => {
        try {
            const response = await generateSplChainStream(uuid);
            if (!response?.body) {
                return rejectWithValue('Response body is null');
            }
            // 获取读取流
            const reader = response.body.getReader();
            const textDecoder = new TextDecoder("utf-8");  // 用于解码字节为字符串
            let compileInfo = ""
            // 按块读取流数据
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;  // 如果流结束，退出循环

                // 将块数据解码为字符串，并拼接
                const chunk = textDecoder.decode(value, { stream: true });
                const chunk_list = chunk.split('\n\n')
                for (const chunk_part of chunk_list) {
                    if (chunk_part.startsWith('data:')) {
                        const data = chunk_part.replace('data:', '');
                        const chain_chunk = JSON.parse(data)
                        if (chain_chunk['type'] === 'logInfo') {
                            compileInfo += chain_chunk['content'];
                            dispatch({
                                type: 'agent/setAgentStateInfo',
                                payload: {compileInfo: compileInfo},
                            });
                        }
                        if (chain_chunk['type'] === 'result') {
                            dispatch({type: 'agent/setAgentInfo', payload: {spl_chain: chain_chunk['content']}});
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error in WebSocket connection: ', error);
            // return rejectWithValue('Failed to create WebSocket connection');
        }
    }
);

