import {createAsyncThunk} from '@reduxjs/toolkit';
import {
    createConversationAPI,
    deleteConversationAPI,
    updateConversationAPI,
    queryConversationAll,
    queryConversationDetail,
    queryConversationList,
} from '../api/sapper/conversation.ts';
import {
    ConversationUpdateReq,
    ConversationCreateReq,
    GetConversationListParam,
    GetAllConversationParam, GenerateAnswerParam, MessageContent
} from "../types/conversationType.ts";
import {generateAnswerStream} from "../api/sapper/agent";

// 获取所有会话
export const fetchAllConversations = createAsyncThunk(
    'conversation/fetchAllConversations',
    async (param: GetAllConversationParam, { rejectWithValue }) => {
        try {
            return await queryConversationAll(param);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch all conversations');
        }
    }
);

// 获取会话详情
export const fetchConversationDetail = createAsyncThunk(
    'conversation/fetchConversationDetail',
    async (data: {conversationId: string, query: MessageContent[] | null}, { rejectWithValue }) => {
        try {
            const conversation = await queryConversationDetail(data.conversationId);
            if (data.query !== null) {
                conversation.chat_history = [
                    {role: "user", contents: data.query},
                    {role: "system", units: []}
                ]
                conversation.suggestions = []
            }
            return conversation
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch conversation details');
        }
    }
);

// 获取会话列表（分页）
export const fetchConversationList = createAsyncThunk(
    'conversation/fetchConversationList',
    async (data: { agent_uuid: string, params: GetConversationListParam | undefined}, { rejectWithValue }) => {
        try {
            return await queryConversationList(data.agent_uuid, data.params);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to fetch conversation list');
        }
    }
);

// 创建会话
export const createConversation = createAsyncThunk(
    'conversation/createNewConversation',
    async (data: ConversationCreateReq, { rejectWithValue }) => {
        try {
            return await createConversationAPI(data);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to create conversation');
        }
    }
);

// 更新会话
export const updateConversation = createAsyncThunk(
    'conversation/updateConversationInfo',
    async ({ conversationUuid, data }: { conversationUuid: string; data: ConversationUpdateReq }, { rejectWithValue }) => {
        try {
            await updateConversationAPI(conversationUuid, data);
            return { conversationUuid, data }
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to update conversation');
        }
    }
);


// 批量删除会话
export const deleteConversation = createAsyncThunk(
    'conversation/deleteConversations',
    async (id: number, { rejectWithValue }) => {
        try {
            await deleteConversationAPI(id);
            return id
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data?: never } };
                if (err.response && 'data' in err.response) {
                    return rejectWithValue(err.response.data);
                }
            }
            return rejectWithValue('Failed to delete conversations');
        }
    }
);


export const generateAnswer = createAsyncThunk(
    'conversation/generateAnswer',
    async ({ uuid, data, controller }: { uuid: string; data: GenerateAnswerParam, controller: AbortController }, { dispatch, rejectWithValue}) => {
        try {
            const response = await generateAnswerStream(uuid, data, controller);
            if (!response?.body) {
                return rejectWithValue('Response body is null');
            }

            const reader = response.body.getReader();
            const textDecoder = new TextDecoder("utf-8");
            let units = null;

            try {
                let header_buffer = ""
                let tail_buffer = ""
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    let str_chunk = textDecoder.decode(value, { stream: true });
                    if(header_buffer || tail_buffer){
                        console.log(header_buffer, tail_buffer)
                        str_chunk = tail_buffer + str_chunk + header_buffer;
                        header_buffer = ""
                        tail_buffer = ""
                    }
                    const chunk_list = str_chunk.split('\n\n').filter(chunk => !/^\s*$/.test(chunk));

                    if (chunk_list.length > 0) {
                        // 处理头部：如果不是 "data: " 开头，移除第一个元素并缓存
                        if (!str_chunk.startsWith("data: ")) {
                            header_buffer = chunk_list.shift() as string; // 移除并返回第一个元素
                        }

                        // 处理尾部：如果不是 "\n\n" 结尾，移除最后一个元素并缓存
                        if (!str_chunk.endsWith("\n\n")) {
                            tail_buffer = chunk_list.pop() as string; // 移除并返回最后一个元素
                        }
                    }

                    for (let chunk of chunk_list) {
                        chunk = chunk.replace('data:', '');
                        try {
                            const parsedData = JSON.parse(chunk);
                            if (parsedData.current_unit?.output?.type === 'suggestion') {
                                dispatch({
                                    type: 'conversation/setConversationInfo',
                                    payload: {suggestions: parsedData.current_unit?.output?.content},
                                });
                            }

                            if (units === null) {
                                units = { ...parsedData.units }; // 深拷贝初始units
                            }

                            const current_unit = { ...parsedData.current_unit };
                            const current_unit_content = { ...current_unit.output };
                            const current_unit_name = current_unit.unit_name;
                            let current_unit_output: MessageContent[] = [];
                            if (units[current_unit_name] !== null && units[current_unit_name] !== undefined) {
                                // 创建可修改的output副本
                                current_unit_output = Array.isArray(units[current_unit_name].output)
                                    ? [...units[current_unit_name].output]
                                    : [];

                                if (current_unit_content.type === 'url') {
                                    current_unit_output = [...current_unit_output, {...current_unit_content, type: 'image'}];
                                }
                                else if (current_unit_content.type === 'text') {
                                    // 检查是否需要新建text项
                                    if (current_unit_output.length === 0 ||
                                        current_unit_output[current_unit_output.length - 1].type !== 'text') {
                                        current_unit_output = [...current_unit_output, { content: "", type: "text" }];
                                    }

                                    // 更新最后一项内容（不直接修改原数组）
                                    const lastIndex = current_unit_output.length - 1;
                                    current_unit_output = current_unit_output.map((item, index) =>
                                        index === lastIndex
                                            ? { ...item, content: item.content + current_unit_content.content }
                                            : item
                                    );
                                }else {
                                    current_unit_output = [...current_unit_output, {...current_unit_content}];
                                }
                                // console.log(current_unit_output)
                                // 更新units（始终创建新对象）
                                units = {
                                    ...units,
                                    [current_unit_name]: {
                                        ...current_unit,
                                        output: current_unit_output
                                    }
                                };
                                // console.log(units)
                                // 更新Redux状态（传递全新数组）
                                // console.log(units);
                                dispatch({
                                    type: 'conversation/setConversationAnswerInfo',
                                    payload: Object.values({ ...units }),
                                });
                            }

                        } catch (error) {
                            console.error('Error parsing chunk:', chunk, error);
                        }
                    }
                }

                console.log('Stream completed successfully');

            } catch (error) {
                console.error('Error during stream reading:', error);
                throw error;
            } finally {
                controller.abort();
                reader.releaseLock();
            }

        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (error.name === 'AbortError') {
                console.log('请求已被取消');
                return rejectWithValue('Request aborted');
            }

            console.error('Error in generateAnswer:', error);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return rejectWithValue(error.message || 'Failed to generate answer');
        }
    }
);