export interface Plugin {
    name: string;
    description: string;
    cover_image: string;
    status: number;
}

export interface PluginRes extends Plugin {
    id: number;
    uuid: string;
    user_uuid: string;
    created_time: string;
    updated_time: string;
}

export interface InputParameter {
    name: string;
    description?: string;
    type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object' | 'file';
    location: 'query' | 'header' | 'path' | 'body' | 'cookie';
    required: boolean;
    default?: never;
    enabled: boolean;
    properties?: InputParameter[];
    items?: InputParameter;
}

export interface OutputParameter {
    name: string;
    description?: string;
    type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object' | 'file';
    enabled: boolean;
    properties?: OutputParameter[];
    items?: OutputParameter;
}

export interface Header {
    name: string;
    value: string;
}

export interface AuthConfig {
    type: 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'none';
    token?: string;
    username?: string;
    password?: string;
    api_key?: string;
    api_key_location?: 'query' | 'header' | 'path' | 'body' | 'cookie';
    api_key_name?: string;
    token_url?: string;
    client_id?: string;
    client_secret?: string;
}

export interface RequestBody {
    mode: 'formdata' | 'urlencoded' | 'raw' | 'binary' | 'graphql' | 'none';
    content_type?: string;
    schema?: Record<string, never>;
}

export interface ResponseDefinition {
    status_code: number;
    description?: string;
    content_type?: string;
    schema?: Record<string, never>;
}

export interface PluginDetail extends PluginRes {
    server_url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    input_parameters: InputParameter[];
    request_body?: RequestBody;
    auth_config: AuthConfig;
    headers?: Header[];
    output_parameters: OutputParameter[];
    responses: ResponseDefinition[];
    parse_path?: (string | number)[];
    category?: string;
    type: number;
}

export interface PluginPagination {
    items: PluginRes[];
    links: string[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface GetPluginListParam {
    page?: number;
    size?: number;
    name?: string;
    category?: string;
    type?: number;
    status?: number;
}

export interface PluginCreateReq {
    name: string;
    description: string;
    cover_image: string;
    status: number;
    server_url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    input_parameters: InputParameter[];
    request_body?: RequestBody;
    auth_config: AuthConfig;
    headers?: Header[];
    output_parameters: OutputParameter[];
    responses: ResponseDefinition[];
    parse_path?: (string | number)[];
    category?: string;
    type: number;
}

export interface PluginUpdateReq {
    name?: string;
    description?: string;
    cover_image?: string;
    status?: number;
    server_url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    input_parameters?: InputParameter[];
    request_body?: RequestBody;
    auth_config?: AuthConfig;
    headers?: Header[];
    output_parameters?: OutputParameter[];
    responses?: ResponseDefinition[];
    category?: string;
    type?: number;
}

export interface PluginState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    plugins: PluginPagination;
    publicPlugins: PluginPagination;
    pluginDetail: PluginDetail | null;
}
