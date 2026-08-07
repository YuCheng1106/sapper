import axios from '../interceptor';
import {
    CollectionCreateReq,
    CollectionDetail,
    CollectionPagination,
    CollectionRes,
    CollectionUpdateReq,
    GetCollectionListParam
} from "../../types/collectionType";



// 获取所有知识库
export function queryCollectionAll(): Promise<CollectionPagination> {
    return axios.get('/api/v1/sapper/text-collections/all');
}

// 获取知识库详情
export function queryCollectionDetail(id: number): Promise<CollectionDetail> {
    return axios.get(`/api/v1/sapper/text-collections/${id}`);
}

// 获取知识库列表（分页）
export function queryCollectionList(params?: GetCollectionListParam): Promise<CollectionPagination> {
    return axios.get('/api/v1/sapper/text-collections', {
        params
    });
}

// 创建知识库
export function createCollectionAPI(data: CollectionCreateReq): Promise<CollectionRes> {
    return axios.post(`/api/v1/sapper/text-collections`, data);
}

// 更新知识库
export function updateCollectionAPI(id: number, data: CollectionUpdateReq) {
    return axios.put(`/api/v1/sapper/text-collections/${id}`, data);
}

// 删除知识库
export function deleteCollectionAPI(pk: number) {
    return axios.delete(`/api/v1/sapper/text-collections`, {
        data: {
            pks: [pk]
        }
    });
}

