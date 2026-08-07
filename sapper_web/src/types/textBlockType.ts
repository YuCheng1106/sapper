export interface TextBlock {
    content: string;
}

export interface TextBlockRes extends TextBlock {
    id: number;
    uuid: string;
    collection_uuid: string;
    created_time: string;
    updated_time: string;
}

export interface TextBlockDetail extends TextBlockRes {
    text_blocks: []
}

export interface TextBlockPagination {
    items: TextBlockRes[];
    links: string[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetTextBlockListParam {
    page?: number;
    size?: number;
    content?: string;
    text_collection_id: number;
}

export interface TextBlockCreateReq {
    text_collection_id: number;
    content: string;
}

export interface TextBlockUpdateReq {
    content?: string;
}

export interface TextBlockState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    textBlocks: TextBlockPagination;
    textBlockDetail: TextBlockDetail | null;
}

