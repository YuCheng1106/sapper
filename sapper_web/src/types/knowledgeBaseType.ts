import {CollectionRes} from "./collectionType";
import {GraphCollectionRes} from "./graphCollectionType.ts";

export interface KnowledgeBase {
    name: string;
    description: string;
    cover_image: string;
    embedding_model: string;
    status: number;
}

export interface KnowledgeBaseRes extends KnowledgeBase {
    id: number;
    uuid: string;
    user_uuid: string;
    created_time: string;
    updated_time: string;
}

export interface KnowledgeBaseDetail extends KnowledgeBaseRes {
    collections: CollectionRes[]
    graph_collections: GraphCollectionRes[]
}

export interface KnowledgeBasePagination {
    items: KnowledgeBaseRes[];
    links: string[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetKnowledgeBaseListParam {
    page?: number;
    size?: number;
    name?: string;
}

export interface KnowledgeBaseCreateReq {
    name: string;
    description: string;
    cover_image: string;
    status: number;
}

export interface KnowledgeBaseUpdateReq {
    name?: string;
    description?: string;
    cover_image?: string;
    status?: number;
    embedding_model?: string;
}


export interface KnowledgeBaseState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    knowledgeBases: KnowledgeBasePagination;
    knowledgeBaseDetail: KnowledgeBaseDetail | null;
}
