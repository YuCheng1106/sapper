from pydantic import BaseModel
from .data import TextData, GraphData
from typing import Dict, List, Optional, Any, Union
from pydantic import Field, HttpUrl, ConfigDict
from enum import Enum

class HttpMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class AuthType(str, Enum):
    BEARER = "bearer"
    BASIC = "basic"
    APIKEY = "apikey"
    OAUTH2 = "oauth2"
    NONE = "none"

class BodyMode(str, Enum):
    FORMDATA = "formdata"
    URLENCODED = "urlencoded"
    RAW = "raw"
    BINARY = "binary"
    GRAPHQL = "graphql"
    NONE = "none"


class ParameterLocation(str, Enum):
    QUERY = "query"
    HEADER = "header"
    PATH = "path"
    BODY = "body"
    COOKIE = "cookie"


class ParameterType(str, Enum):
    STRING = "string"
    INTEGER = "integer"
    NUMBER = "number"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"
    FILE = "file"


class InputParameter(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(description="参数名称")
    description: Optional[str] = Field(None, description="参数描述")
    type: ParameterType = Field(description="参数类型")
    location: ParameterLocation = Field(description="传入方法")
    required: bool = Field(default=False, description="是否必填")
    enabled: bool = Field(default=True, description="是否开启")
    default: Optional[Any] = Field(None, description="默认值")
    # 为 object 和 array 类型添加嵌套参数定义
    properties: Optional[List['InputParameter']] = Field(default=None, description="对象属性定义")
    items: Optional['InputParameter'] = Field(default=None, description="数组元素定义")

class OutputParameter(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(description="参数名称")
    description: Optional[str] = Field(None, description="参数描述")
    type: ParameterType = Field(description="参数类型")
    enabled: bool = Field(default=True, description="是否开启")
    # 为 object 和 array 类型添加嵌套参数定义
    properties: Optional[List['OutputParameter']] = Field(default=None, description="对象属性定义")
    items: Optional['OutputParameter'] = Field(default=None, description="数组元素定义")

class Header(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(description="请求头名称")
    value: str = Field(description="请求头值")

class AuthConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    type: AuthType = Field(default=AuthType.NONE, description="认证类型")
    token: Optional[str] = Field(default=None, description="令牌值")
    username: Optional[str] = Field(default=None, description="用户名")
    password: Optional[str] = Field(default=None, description="密码")
    api_key: Optional[str] = Field(default=None, description="API密钥")
    api_key_location: Optional[ParameterLocation] = Field(default=ParameterLocation.HEADER, description="API密钥位置")
    api_key_name: Optional[str] = Field(default=None, description="API密钥字段名")
    token_url: Optional[HttpUrl] = Field(default=None, description="OAuth2令牌URL")
    client_id: Optional[str] = Field(default=None, description="客户端ID")
    client_secret: Optional[str] = Field(default=None, description="客户端密钥")


class RequestBody(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mode: Optional[BodyMode] = Field(None, description="请求体模式")
    content_type: Optional[str] = Field("application/json", description="内容类型")
    schema_def: Optional[Dict[str, Any]] = Field(None, description="请求体JSON Schema", alias="schema")
    raw_example: Optional[Any] = Field(None, description="原始数据示例")


class ResponseDefinition(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status_code: int = Field(description="HTTP状态码")
    description: Optional[str] = Field(None, description="响应描述")
    content_type: Optional[str] = Field("application/json", description="内容类型")
    schema_def: Optional[Dict[str, Any]] = Field(None, description="响应体JSON Schema", alias="schema")
    parse_path: Optional[List[Union[str, int]]] = Field(None, description="返回值解析路径")
    example: Optional[Any] = Field(None, description="响应示例")


class API(BaseModel):
    uuid: Optional[str] = Field(default="")
    name: Optional[str] = Field(default=None, description='插件名')
    description: Optional[str] = Field(default=None,  description='简介')
    server_url: Optional[HttpUrl] = Field(default=None, description='插件服务地址')
    method: Optional[HttpMethod] = Field(default=HttpMethod.POST, description="HTTP请求方法")
    input_parameters: List[InputParameter] = Field(default_factory=list, description='输入参数列表')
    input_data: Optional[Dict] = Field(default_factory=dict, description='输入值')
    request_body: Optional[RequestBody] = Field(default=None, description='请求体定义')
    auth_config: AuthConfig = Field(default_factory=lambda: AuthConfig(type=AuthType.NONE), description='认证配置')
    headers: Optional[List[Header]] = Field(default=None, description='固定请求头')
    output_parameters: List[OutputParameter] = Field(default_factory=list, description='输出参数列表')
    responses: List[ResponseDefinition] = Field(default_factory=list, description='响应定义列表')
    return_value_type: Optional[str] = Field(default='text', description='返回值类型')
    content_type: Optional[str] = Field(default='text', description='返回值类型')
    stream: Optional[bool] = False


class KnowledgeBase(BaseModel):
    uuid: str
    name: str
    description: str
    embedding_model: str
    text_collections: Optional[list[TextData]] = Field(default_factory=list)
    graph_collections: Optional[list[GraphData]] = Field(default_factory=list)

class Parameter(BaseModel):
    uuid: str
    type: str
    placeholder: str
    description: str
    value: str