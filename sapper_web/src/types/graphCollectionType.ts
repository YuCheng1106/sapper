export interface GraphCollection {
    name: string;
    file_url: string;
    processing_method: string;
    training_mode: string;
    status: number;
}

export interface GraphCollectionRes extends GraphCollection {
    id: number;
    uuid: string;
    knowledge_base_uuid: string;
    created_time: string;
    updated_time: string;
}

export interface GraphCollectionDetail extends GraphCollectionRes {
    text_blocks: []
}

export interface GraphCollectionPagination {
    items: GraphCollectionRes[];
    links: string[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetGraphCollectionListParam {
    page?: number;
    size?: number;
    knowledge_base_uuid?: string;
    description?: string;
    name?: string;
}

export interface GraphCollectionCreateReq {
    knowledge_base_uuid: string;
    name: string;
    file_url: string;
    status: number;
}

export interface GraphCollectionUpdateReq {
    name?: string;
    status?: number;
}


export interface GraphCollectionState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    graphCollections: GraphCollectionPagination;
    graphCollectionDetail: GraphCollectionDetail | null;
}
