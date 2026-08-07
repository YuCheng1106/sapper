import axios from '../interceptor';
import {
    KnowledgeBaseCreateReq,
    KnowledgeBaseDetail,
    KnowledgeBasePagination,
    KnowledgeBaseRes,
    KnowledgeBaseUpdateReq,
    GetKnowledgeBaseListParam
} from "../../types/knowledgeBaseType";



// 获取所有知识库
export function queryKnowledgeBaseAll(): Promise<KnowledgeBaseRes[]> {
    return axios.get('/api/v1/sapper/knowledge-bases/all');
}

// 获取知识库详情
export function queryKnowledgeBaseDetail(uuid: string): Promise<KnowledgeBaseDetail> {
    return axios.get(`/api/v1/sapper/knowledge-bases/${uuid}`);
}

// 获取知识库列表（分页）
export function queryKnowledgeBaseList(params?: GetKnowledgeBaseListParam): Promise<KnowledgeBasePagination> {
    return axios.get('/api/v1/sapper/knowledge-bases', {
        params
    });
}

// 创建知识库
export function createKnowledgeBaseAPI(data: KnowledgeBaseCreateReq): Promise<KnowledgeBaseRes> {
    return axios.post(`/api/v1/sapper/knowledge-bases`, data);
}

// 更新知识库
export function updateKnowledgeBaseAPI(uuid: string, data: KnowledgeBaseUpdateReq): Promise<KnowledgeBaseRes> {
    return axios.put(`/api/v1/sapper/knowledge-bases/${uuid}`, data);
}

// 删除知识库
export function deleteKnowledgeBaseAPI(pk: number): Promise<KnowledgeBaseRes> {
    return axios.delete(`/api/v1/sapper/knowledge-bases`,
        {data: {pks: [pk]}}
    );
}

