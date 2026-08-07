import axios from '../interceptor';
import {
    TextBlockCreateReq,
    TextBlockDetail,
    TextBlockPagination,
    TextBlockRes,
    TextBlockUpdateReq,
    GetTextBlockListParam
} from "../../types/textBlockType";

// 获取所有知识库
export function queryTextBlockAll(): Promise<TextBlockPagination> {
    return axios.get('/api/v1/sapper/text-blocks/all');
}

// 获取知识库详情
export function queryTextBlockDetail(id: number): Promise<TextBlockDetail> {
    return axios.get(`/api/v1/sapper/text-blocks/${id}`);
}

// 获取知识库列表（分页）
export function queryTextBlockList(params?: GetTextBlockListParam): Promise<TextBlockPagination> {
    return axios.get('/api/v1/sapper/text-blocks', {
        params
    });
}

// 创建知识库
export function createTextBlockAPI(data: TextBlockCreateReq): Promise<TextBlockRes> {
    return axios.post(`/api/v1/sapper/text-blocks`, data);
}

// 更新知识库
export function updateTextBlockAPI(id: number, data: TextBlockUpdateReq) {
    return axios.put(`/api/v1/sapper/text-blocks/${id}`, data);
}

// 删除知识库
export function deleteTextBlockAPI(pk: number): Promise<void> {
    return axios.delete(`/api/v1/sapper/text-blocks`,
        {
            data: {
                pks: [pk]
            }
        }
    );
}
