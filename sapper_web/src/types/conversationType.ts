import {AgentDetail} from "./agentType";


interface BaseChatMessage {
    role: "user" | "system" | "assistant";
}

export interface MessageContent {
    type: "text" | "image" | "progress" | "video" | "audio" | "error" | "code" | "file";
    content: string;
}

export interface SystemMessageContent {
    unit_name: string;
    unit_type: string;
    status: 'running' | 'success' | 'error';
    output: MessageContent[],
    current_ref: {
        ref_id: string;
        ref_name: string;
        ref_type: string;
    },
}

// 系统消息
export interface SystemChatMessage extends BaseChatMessage {
    role: "system";
    units: SystemMessageContent[];
}

// 用户消息
export interface UserChatMessage extends BaseChatMessage {
    role: "user";
    contents: MessageContent[];
}

export type ChatMessageItem = UserChatMessage | SystemChatMessage;

export interface GenerateAnswerParam {
    query: MessageContent[];
    conversation_uuid: string;
}

export interface Conversation {
    name: string;
}

export interface ConversationRes extends Conversation {
    id: number;
    uuid: string;
    creator_id: string;
    agent_id: string;
    created_time: string;
    updated_time: string;
}

export interface ConversationDetail extends ConversationRes {
    agent: AgentDetail | null;
    chat_history: ChatMessageItem[];
    chat_parameters: Record<string, string>;
    short_memory: string;
    long_memory: string;
    suggestions: [];
}

export interface ConversationPagination {
    items: Array<ConversationRes>;
    links: Array<string>;
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetAllConversationParam {
    agent_id?: string;
    creator_id?: string;
}

export interface GetConversationListParam {
    page?: number;
    size?: number;
}

export interface ConversationCreateReq {
    name: string;
    agent_uuid: string;
    status?: number;
}

export interface ConversationUpdateReq {
    name?: string;
    chat_history?: ChatMessageItem[];
    chat_parameters?: Record<string, string>;
    short_memory?: string;
    long_memory?: string;
}


export interface ConversationState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    isNewConversation: boolean;
    query: MessageContent[] | null;
    conversations: ConversationPagination;
    conversationDetail: ConversationDetail | null;
}