#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime
from app.admin.schema.user import UserInfoSchemaBase
from common.schema import SchemaBase
from pydantic import BaseModel
from enum import IntEnum
from typing import Dict, List, Optional, Any, Union
from pydantic import Field, HttpUrl, ConfigDict
from enum import Enum

class PluginType(IntEnum):
    """插件类型枚举"""
    AGENT_PLUGIN = 0  # 智能体插件
    COMMON_PLUGIN = 1  # 普通插件

class PluginStatus(IntEnum):
    """插件状态枚举"""
    DISABLED = 0  # 停用
    ACTIVE = 1  # 正常

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


class InputParameter(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(description="参数名称")
    description: Optional[str] = Field(None, description="参数描述")
    type: ParameterType = Field(description="参数类型")
    location: ParameterLocation = Field(description="传入方法")
    required: bool = Field(default=False, description="是否必填")
    enabled: bool = Field(default=True, description="是否开启")
    default: Optional[Any] = Field(None, description="默认值")
    properties: Optional[List['OutputParameter']] = Field(None, description="对象属性定义")
    items: Optional['OutputParameter'] = Field(None, description="数组元素定义")


class OutputParameter(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(description="参数名称")
    description: Optional[str] = Field(None, description="参数描述")
    type: ParameterType = Field(description="参数类型")
    enabled: bool = Field(default=True, description="是否开启")
    properties: Optional[List['OutputParameter']] = Field(None, description="对象属性定义")
    items: Optional['OutputParameter'] = Field(None, description="数组元素定义")


class AuthConfig(SchemaBase):
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

class Header(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(description="请求头名称")
    value: str = Field(description="请求头值")


class RequestBody(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    mode: Optional[BodyMode] = Field(None, description="请求体模式")
    content_type: Optional[str] = Field("application/json", description="内容类型")
    schema_def: Optional[Dict[str, Any]] = Field(None, description="请求体JSON Schema", alias="schema")
    raw_example: Optional[Any] = Field(None, description="原始数据示例")


class ResponseDefinition(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    status_code: int = Field(description="HTTP状态码")
    description: Optional[str] = Field(None, description="响应描述")
    content_type: Optional[str] = Field("application/json", description="内容类型")
    schema_def: Optional[Dict[str, Any]] = Field(None, description="响应体JSON Schema", alias="schema")
    parse_path: Optional[List[Union[str, int]]] = Field(None, description="返回值解析路径")
    example: Optional[Any] = Field(None, description="响应示例")

class PluginSchemaBase(SchemaBase):
    """插件基础模型"""
    name: str = Field(description='插件名')
    description: str = Field(description='简介')
    # 服务器配置
    server_url: HttpUrl = Field(description='插件服务地址')
    # HTTP 方法
    method: HttpMethod = Field(default=HttpMethod.POST, description="HTTP请求方法")
    # 输入参数
    input_parameters: List[InputParameter] = Field(default_factory=list, description='输入参数列表')
    # 请求体配置
    request_body: Optional[RequestBody] = Field(None, description='请求体定义')
    # 认证配置
    auth_config: AuthConfig = Field(default_factory=lambda: AuthConfig(type=AuthType.NONE), description='认证配置')
    # 请求配置
    headers: Optional[List[Header]] = Field(None, description='固定请求头')
    # 输出参数
    output_parameters: List[OutputParameter] = Field(default_factory=list, description='输出参数列表')
    return_value_type: str = Field(default="Text", description='输出内容类型')
    stream: bool = Field(default=False, description="是否流式")
    # 响应处理
    responses: List[ResponseDefinition] = Field(default_factory=list, description='响应定义列表')
    # 插件元数据
    cover_image: Optional[HttpUrl] = Field(default=None, description='封面图像地址')
    category: Optional[str] = Field(None, description='插件分类')
    type: int = Field(default=1, description="插件类型(0智能体插件 1普通插件)")
    status: int = Field(default=1, description="插件状态(0停用 1正常)")

class CreatePluginParam(PluginSchemaBase):
    """添加插件参数"""
    creator_id: Optional[int] = Field(None, description='创建者 ID')

class UpdatePluginParam(SchemaBase):
    """更新插件参数模型"""
    name: str = Field(None, description='插件名')
    description: str = Field(None, description='简介')
    server_url: Optional[HttpUrl] = Field(None, description='插件服务地址')
    method: Optional[HttpMethod] = Field(default=HttpMethod.POST, description="HTTP请求方法")
    input_parameters: Optional[List[InputParameter]] = Field(None, description='输入参数列表')
    request_body: Optional[Optional[RequestBody]] = Field(None, description='请求体定义')
    auth_config: Optional[AuthConfig] = Field(None, description='认证配置')
    headers: Optional[List[Dict[str, str]]] = Field(None, description='固定请求头')
    return_value_type: Optional[str] = Field(default=None, description='输出内容类型')
    stream: Optional[bool] = Field(default=None, description="是否流式")
    output_parameters: Optional[List[OutputParameter]] = Field(None, description='输出参数列表')
    responses: Optional[List[ResponseDefinition]] = Field(None, description='响应定义列表')
    cover_image: Optional[HttpUrl] = Field(None, description='封面图像地址')
    category: Optional[str] = Field(None, description='插件分类')
    type: Optional[int] = Field(None, description="插件类型(0智能体插件 1普通插件)")
    status: Optional[int] = Field(None, description="插件状态(0停用 1正常)")

class DeletePluginParam(SchemaBase):
    """删除插件参数"""
    pks: list[int] = Field(description='插件 ID 列表')


class GetPluginDetail(PluginSchemaBase):
    """插件信息详情"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description='插件 ID')
    uuid: str = Field(description='插件 UUID')
    created_time: datetime = Field(description='插件创建时间')
    updated_time: Optional[datetime] = Field(None, description='插件更新时间')


class GetPluginWithRelationDetail(GetPluginDetail):
    """插件信息关联详情"""

    model_config = ConfigDict(from_attributes=True)

    creator: UserInfoSchemaBase = Field(description='创建者详情')

class GetPluginRunChain(GetPluginDetail):
    pass
