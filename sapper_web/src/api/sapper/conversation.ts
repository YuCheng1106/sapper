import axios from '../interceptor';
import {
    ConversationCreateReq, ConversationDetail,
    ConversationPagination,
    ConversationRes,
    ConversationUpdateReq, GetAllConversationParam, GetConversationListParam
} from "../../types/conversationType.ts";


// 获取所有会话
export function queryConversationAll(params: GetAllConversationParam): Promise<ConversationRes[]> {
    return axios.get('/api/v1/sapper/conversations/all', {
        params
    });
}

// 获取会话详情
export function queryConversationDetail(uuid: string): Promise<ConversationDetail> {
    return axios.get(`/api/v1/sapper/conversations/${uuid}`);
}

// 获取会话列表（分页）
export function queryConversationList(agent_uuid: string, params?: GetConversationListParam): Promise<ConversationPagination> {
    return axios.get(`/api/v1/sapper/conversations?agent_uuid=${agent_uuid}`, {
        params
    });
}

// 创建会话
export function createConversationAPI(data: ConversationCreateReq): Promise<ConversationRes> {
    return axios.post(`/api/v1/sapper/conversations`, data);
}

// 更新会话
export function updateConversationAPI(uuid: string, data: ConversationUpdateReq) {
    return axios.put(`/api/v1/sapper/conversations/${uuid}`, data);
}

// 删除会话
export function deleteConversationAPI(pk: number) {
    return axios.delete(`/api/v1/sapper/conversations`, {
        data: { pks: [pk] }
    });
}