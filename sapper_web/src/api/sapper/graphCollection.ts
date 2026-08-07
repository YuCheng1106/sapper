import axios from '../interceptor';
import {
    GraphCollectionCreateReq,
    GraphCollectionDetail,
    GraphCollectionPagination,
    GraphCollectionRes,
    GraphCollectionUpdateReq,
    GetGraphCollectionListParam
} from "../../types/graphCollectionType";



// 获取所有知识库
export function queryGraphCollectionAll(): Promise<GraphCollectionPagination> {
    return axios.get('/api/v1/sapper/graph-collections/all');
}

// 获取知识库详情
export function queryGraphCollectionDetail(uuid: string): Promise<GraphCollectionDetail> {
    return axios.get(`/api/v1/sapper/graph-collections/${uuid}`);
}

// 获取知识库列表（分页）
export function queryGraphCollectionList(params?: GetGraphCollectionListParam): Promise<GraphCollectionPagination> {
    return axios.get('/api/v1/sapper/graph-collections', {
        params
    });
}

// 创建知识库
export function createGraphCollectionAPI(data: GraphCollectionCreateReq): Promise<GraphCollectionRes> {
    return axios.post(`/api/v1/sapper/graph-collections`, data);
}

// 更新知识库
export function updateGraphCollectionAPI(id: number, data: GraphCollectionUpdateReq) {
    return axios.put(`/api/v1/sapper/graph-collections/${id}`, data);
}

// 删除知识库
export function deleteGraphCollectionAPI(pk: number) {
    return axios.delete(`/api/v1/sapper/graph-collections`,
        {
            data: {
                pks: [pk]
            }
        }
    );
}

