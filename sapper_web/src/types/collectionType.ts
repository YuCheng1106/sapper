export interface Collection {
    name: string;
    file_url: string;
    processing_method: string;
    training_mode: string;
    status: number;
}

export interface CollectionRes extends Collection {
    id: number;
    uuid: string;
    knowledge_base_uuid: string;
    created_time: string;
    updated_time: string;
}

export interface CollectionDetail extends CollectionRes {
    text_blocks: []
}

export interface CollectionPagination {
    items: CollectionRes[];
    links: string[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetCollectionListParam {
    page?: number;
    size?: number;
    knowledge_base_uuid?: string;
    description?: string;
    name?: string;
}

export interface CollectionCreateReq {
    knowledge_base_uuid: string;
    name: string;
    file_url: string;
    processing_method: string;
    training_mode: string;
    status: number;
}

export interface CollectionUpdateReq {
    name?: string;
    status?: number;
}


export interface CollectionState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    collections: CollectionPagination;
    collectionDetail: CollectionDetail | null;
}
