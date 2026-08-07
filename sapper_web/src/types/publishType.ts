export interface AgentPublishment {
    publish_config: Record<string, unknown>;
}

export interface AgentPublishmentRes extends AgentPublishment {
    id: number;
    agent_id: number;
    channel_id: number;
    published_by: number;
    created_time: string;
    updated_time: string;
}

export interface AgentPublishmentDetail extends AgentPublishmentRes {
     channel: Record<string, unknown>;
}

export interface AgentPublishmentPagination {
    items: Array<AgentPublishmentRes>;
    links: Array<string>;
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetAgentPublishmentListParam {
    page?: number;
    size?: number;
    name?:string
}

export interface PublishmentItem {
    channel_id: number,
    publish_config?: Record<string, never>
}

export interface AgentPublishmentCreateReq {
    agent_uuid: string;
    channels: PublishmentItem[];
}

export interface AgentPublishmentUpdateReq {
    publish_config?: Record<string, unknown>;
}


export interface AgentPublishmentState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    agentPublishments: AgentPublishmentPagination;
    agentPublishmentDetail: AgentPublishmentDetail | null;
}
