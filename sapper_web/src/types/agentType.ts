import {KnowledgeBaseRes} from "./knowledgeBaseType";
import {PluginDetail} from "./pluginType";
import {ConversationDetail, ConversationRes} from "./conversationType.ts";
import {AgentPublishmentDetail} from "./publishType.ts";
import {UserInfo} from "./userType.ts";

// 定义 KeyType 类型（联合类型）
export type AgentTagType = 'tools' | 'services' | 'education' | 'code' | 'lifestyle' | 'games';

// 定义映射关系（Record<KeyType, string>）
export const keyToTagMap: Record<AgentTagType, string> = {
    'tools': '效率工具',
    'services': '商业服务',
    'education': '学习教育',
    'code': '代码助手',
    'lifestyle': '生活方式',
    'games': '竞技游戏'
} as const;


export interface Agent {
    name: string;
    description: string;
    cover_image: string;
    tags: AgentTagType[];
    type: number;
    has_short_memory: boolean;
    has_long_memory: boolean;
    status: number;
    suggestion: boolean;
    output_chaining: boolean;
}


export interface UserAgentInteraction {
    id: number;
    uuid: string;
    rating_value: number;
    is_favorite: boolean;
    usage_count: number;
}

export interface AgentRes extends Agent {
    id: number;
    uuid: string;
    creator_id: string;
    user_interaction: UserAgentInteraction
    rating_count: number;
    total_rating: number;
    total_favorites: number
    total_usage: number;
    unique_users: number;
    created_time: string;
    updated_time: string;
    creator: UserInfo;
}


export interface AgentParameter {
    /** 参数类型：系统参数或用户参数 */
    type: 'system' | 'user';

    /** 填充类型：填空式或多选式 */
    fill_type?: 'cloze' | 'select';

    /** 值类型：文本、图片、数字或布尔值 */
    value_type: 'text' | 'image' | 'number' | 'boolean';

    /** 参数占位符文本 */
    placeholder: string;

    /** 可选项（当 fill_type 为 multiple 或 select 时使用） */
    options?: Array<{
        value: string;
    }>;

    /** 参数默认内容 */
    content: string;

    /** 是否必填（可选字段） */
    required?: boolean;

    /** 参数描述（可选字段） */
    description?: string;

    /** 验证规则（可选字段） */
    validation?: {
        pattern?: RegExp | string;
        min?: number;
        max?: number;
        message?: string;
    };
}

export interface AgentSPLFormSubSectionContent {
    content: string;
}

export interface AgentSPLFormSubSection {
    section: AgentSPLFormSubSectionContent[];
    subSectionId: string
}

export interface AgentSPLFormSection {
    sectionId: string
    sectionType: string
    section: AgentSPLFormSubSection[]
}

export interface AgentSPLChainUnit {
    unit_des: AgentSPLFormSection[];
    Input: string;
    Output: string;
    References: []
}

export interface AgentSPLChain {
    workflow: AgentSPLChainUnit[];
}

export interface AgentDetail extends AgentRes {
    spl: string
    spl_form: Array<AgentSPLFormSection>
    spl_chain: AgentSPLChain
    welcome_info: string;
    parameters: Record<string, AgentParameter>;
    sample_query: Array<string>
    conversations: Array<ConversationRes>;
    emulator_conversation: ConversationDetail;
    knowledge_bases: Array<KnowledgeBaseRes>;
    plugins: Array<PluginDetail>;
    publications: Array<AgentPublishmentDetail>;
}

export interface AgentPagination {
    items: Array<AgentRes>;
    links: Array<string>;
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetAgentListParam {
    page?: number;
    size?: number;
    name?:string;
    tag?: string
}

export interface AgentCreateReq {
    name: string;
    description: string;
    cover_image: string;
    status: number;
    type: number;
}

export interface AgentResetPluginsReq {
    plugin_uuids: string[];
}

export interface AgentResetKnowledgeBasesReq {
    knowledge_base_uuids: string[];
}

export interface AgentFavoriteReq {
    favorite: boolean;
}

export interface AgentUpdateReq {
    name?: string;
    description?: string;
    cover_image?: string;
    status?: number;
    spl_form?: Array<AgentSPLFormSection>
    parameters?: Record<string, AgentParameter>;
}


export interface AgentState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    generating: boolean;
    processing: number | null;
    compileInfo: string | null;
    error: string | null;
    agents: AgentPagination;
    publicAgents: AgentPagination;
    agentDetail: AgentDetail | null;
}