import base64
import os
import tempfile
from typing import Dict, Any, List, Union
import httpx
from httpx import Timeout
import json

from common.log import log
from common.upload_file import cos_upload_file
from sapperchain.data_model.base import BodyMode, ParameterLocation, InputParameter, ParameterType, AuthType
from sapperchain.data_model.statement import APIInput

timeout = Timeout(30.0, read=30.0)

class IPostRequest:
    @staticmethod
    async def post_plugin_request(plugin: APIInput):
        """
        根据插件配置执行 API 请求

        Args:
            plugin: 插件配置信息

        Returns:
            API 响应数据
        """
        try:
            # 1. 构建请求 URL
            url = f"{plugin.server_url}"
            # 2. 构建请求头
            headers = await IPostRequest._build_headers(plugin)

            # 3. 构建查询参数
            params = await IPostRequest._build_query_params(plugin, plugin.input_data)

            # 4. 构建请求体
            data = plugin.input_data

            # 5. 处理认证（添加到 headers）
            await IPostRequest._handle_auth(plugin, headers, params)

            log.debug('Calling plugin endpoint (stream={})', plugin.stream)

            if plugin.stream:
                data["stream"] = True
                data = json.dumps(data, ensure_ascii=False)
                async with httpx.AsyncClient(timeout=timeout, verify=True) as client:
                    async with client.stream("POST", url, headers=headers, data=data) as response:
                        async for part in response.aiter_lines():
                            if part and not part.isspace():
                                part_str = part
                                if part_str.startswith('data: '):
                                    part_str = part_str[6:]
                                    if part_str == '[DONE]':
                                        break
                                    try:
                                        decoded_part = json.loads(part_str)
                                        result = decoded_part
                                        output_data = await IPostRequest._build_output_data(plugin, result, structured=False)
                                        # print(output_data, end="")
                                        if type(output_data) == dict:
                                            yield json.dumps(output_data, indent=4, ensure_ascii=False)
                                        else:
                                            yield output_data
                                    except Exception:
                                        log.exception('Failed to process streaming plugin response')
                                else:
                                    log.debug('Ignored non-SSE plugin response line')
                                    pass
            else:
                # 6. 执行 HTTP 请求
                async with httpx.AsyncClient() as client:
                    response = await client.request(
                        method=plugin.method,
                        url=url,
                        headers=headers,
                        params=params,
                        json=data if plugin.request_body and plugin.request_body.mode == BodyMode.RAW else None,
                        data=data if plugin.request_body and plugin.request_body.mode in [BodyMode.FORMDATA,
                                                                                          BodyMode.URLENCODED] else None,
                        timeout=360.0
                    )
                    file_extension = ""
                    if plugin.return_value_type == "audio_base64":
                        file_extension = '.mp3'
                    elif plugin.return_value_type == "image_base64":
                        file_extension = '.png'
                    elif plugin.return_value_type == "video_base64":
                        file_extension = '.mp4'
                    if file_extension != "":
                        # 保存音频文件
                        if len(plugin.output_parameters) > 0:
                            res = await IPostRequest._process_response(plugin, response, structured=False)
                            res = res.get("output_parameters")
                            res = base64.b64decode(res)
                        else:
                            res = response.content
                        with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as temp_file:
                            # 直接将二进制内容写入临时文件
                            temp_file.write(res)
                            filename = temp_file.name
                            file_url = await cos_upload_file(filename, f"file{file_extension}")
                            yield file_url
                        os.remove(filename)
                    else:
                        res = await IPostRequest._process_response(plugin, response, structured=False)
                        res = res.get("output_parameters")
                        # 7. 处理响应
                        if type(res) == dict:
                            yield json.dumps(res, indent=4, ensure_ascii=False)
                        else:
                            yield res

        except Exception as e:
            yield json.dumps({
                "success": False,
                "error": str(e),
                "plugin_name": plugin.name
            }, ensure_ascii=False)

    @staticmethod
    async def _build_headers(plugin: APIInput) -> Dict[str, str]:
        """构建请求头"""
        headers = {}

        # 添加固定请求头列表
        if plugin.headers:
            for header in plugin.headers:
                headers[header.name] = header.value

        # 添加 header 类型的输入参数
        for param in plugin.input_parameters:
            if param.location == ParameterLocation.HEADER and param.required:
                value = param.default or ""
                headers[param.name] = str(value)

        # 设置 Content-Type
        if plugin.request_body and plugin.request_body.content_type:
            headers["Content-Type"] = plugin.request_body.content_type

        return headers

    @staticmethod
    async def _build_query_params(plugin: APIInput, input_data: dict) -> Dict[str, Any]:
        """构建查询参数"""
        params = {}

        for param in plugin.input_parameters:
            if param.location == ParameterLocation.QUERY:
                params[param.name] = input_data.get(param.name, param.default)
        return params

    @staticmethod
    async def _build_request_body(plugin: APIInput) -> Any:
        """构建请求体"""
        if not plugin.request_body:
            return None

        if plugin.request_body.mode == BodyMode.RAW:
            return await IPostRequest._build_raw_body(plugin)
        elif plugin.request_body.mode in [BodyMode.FORMDATA, BodyMode.URLENCODED]:
            return await IPostRequest._build_form_data(plugin)
        else:
            return None

    @staticmethod
    async def _build_raw_body(plugin: APIInput) -> Dict[str, Any]:
        """构建 JSON 请求体"""
        body = {}

        for param in plugin.input_parameters:
            if param.location == ParameterLocation.BODY:
                value = await IPostRequest._build_parameter_value(param)
                if value is not None:
                    body[param.name] = value

        return body

    @staticmethod
    async def _build_form_data(plugin: APIInput) -> Dict[str, Any]:
        """构建表单数据"""
        form_data = {}

        for param in plugin.input_parameters:
            if param.location == ParameterLocation.BODY:
                value = param.default
                if value is not None:
                    form_data[param.name] = value

        return form_data

    @staticmethod
    async def _build_parameter_value(param: InputParameter) -> Any:
        """递归构建参数值"""
        if param.type == ParameterType.OBJECT and param.properties:
            obj_value = {}
            for prop in param.properties:
                prop_value = await IPostRequest._build_parameter_value(prop)
                if prop_value is not None:
                    obj_value[prop.name] = prop_value
            return obj_value if obj_value else None

        elif param.type == ParameterType.ARRAY and param.items:
            item_value = await IPostRequest._build_parameter_value(param.items)
            return [item_value] if item_value is not None else []

        else:
            return param.default

    @staticmethod
    async def _handle_auth(plugin: APIInput, headers: Dict[str, str], params: Dict[str, Any]):
        """处理认证配置"""
        if not plugin.auth_config:
            return

        if plugin.auth_config.type == AuthType.BEARER and plugin.auth_config.token:
            # Bearer Token 认证
            headers["Authorization"] = f"Bearer {plugin.auth_config.token}"
            print(f"已添加 Bearer Token: {plugin.auth_config.token[:10]}...")

        elif plugin.auth_config.type == AuthType.APIKEY and plugin.auth_config.api_key:
            # API Key 认证
            if plugin.auth_config.api_key_location == ParameterLocation.HEADER:
                headers[plugin.auth_config.api_key_name] = plugin.auth_config.api_key
            elif plugin.auth_config.api_key_location == ParameterLocation.QUERY:
                params[plugin.auth_config.api_key_name] = plugin.auth_config.api_key

        elif plugin.auth_config.type == AuthType.BASIC and plugin.auth_config.username and plugin.auth_config.password:
            # Basic 认证
            auth_str = f"{plugin.auth_config.username}:{plugin.auth_config.password}"
            encoded_auth = base64.b64encode(auth_str.encode()).decode()
            headers["Authorization"] = f"Basic {encoded_auth}"

    @staticmethod
    async def _process_response(plugin: APIInput, response: httpx.Response, structured: bool = True) -> Dict[str, Any]:
        """处理 API 响应"""
        try:
            response_data = response.json()
        except json.JSONDecodeError:
            response_data = response.text

        print(f"原始响应: {response_data}")

        # 构建输出参数
        output_data = await IPostRequest._build_output_data(plugin, response_data, structured)
        print(f"新响应: {output_data}")
        return {
            "success": True,
            "status_code": response.status_code,
            "plugin_name": plugin.name,
            "response_data": response_data,
            "output_parameters": output_data
        }

    @staticmethod
    async def _extract_data_by_path(data: Any, path: List[Union[str, int]]) -> Any:
        """根据 parse_path 提取数据"""
        if not path:
            return data

        current = data
        for key in path:
            if isinstance(current, dict) and isinstance(key, str) and key in current:
                current = current[key]
            elif isinstance(current, list) and isinstance(key, int) and 0 <= key < len(current):
                current = current[key]
            else:
                return None
        return current

    @staticmethod
    async def _build_output_data(plugin: APIInput, extracted_data: Any, structured: bool = True) -> Dict[str, Any]:
        """构建输出参数数据"""
        output_data = {}
        plain_res = ""
        for output_param in plugin.output_parameters:
            if output_param.enabled:
                # 递归提取嵌套的输出参数值
                value = await IPostRequest._extract_nested_output_value(output_param, extracted_data, structured)
                output_data[output_param.name] = value
                if not structured:
                    # if output_param.type != ParameterType.OBJECT and output_param.type != ParameterType.ARRAY:
                    return value
        return output_data

    @staticmethod
    async def _extract_nested_output_value(output_param: Any, data: Any, structured: bool = True) -> Any:
        """递归提取嵌套的输出参数值（增强版，支持数组）"""
        if output_param.type == "object" and output_param.properties:
            # 如果是对象类型且有属性定义，递归提取每个属性
            obj_value = {}
            for prop in output_param.properties:
                if prop.enabled:
                    prop_value = await IPostRequest._extract_nested_output_value(prop, data, structured=structured)
                    if prop_value is not None:
                        obj_value[prop.name] = prop_value
                        if not structured:
                            return prop_value

            return obj_value if obj_value else None

        elif output_param.type == "array" and output_param.items:
            # 如果是数组类型且有items定义，递归提取数组中的每个元素
            array_data = await IPostRequest._find_value_in_data(output_param.name, data)
            if array_data is None:
                return None

            if isinstance(array_data, list):
                # 处理数组中的每个元素
                result_list = []
                for item in array_data:
                    item_value = await IPostRequest._extract_nested_output_value(output_param.items, item, structured=False)
                    if item_value is not None:
                        result_list.append(item_value)

                if not structured:
                    if len(result_list) > 0:
                        return result_list.pop()
                    else:
                        return ""

                return result_list if result_list else None
            else:
                # 如果不是列表，尝试直接处理
                return await IPostRequest._extract_nested_output_value(output_param.items, array_data)

        else:
            # 基本类型，直接从数据中提取
            return await IPostRequest._find_value_in_data(output_param.name, data)

    @staticmethod
    async def _find_value_in_data(key: str, data: Any) -> Any:
        """在数据中查找指定键的值（支持嵌套查找和数组处理）"""
        if isinstance(data, dict):
            # 如果键在当前层级，直接返回
            if key in data:
                return data[key]

            # 递归在嵌套字典中查找
            for value in data.values():
                if isinstance(value, (dict, list)):
                    found = await IPostRequest._find_value_in_data(key, value)
                    if found is not None:
                        return found

        elif isinstance(data, list):
            # 在列表中查找，返回第一个匹配的值
            for item in data:
                if isinstance(item, (dict, list)):
                    found = await IPostRequest._find_value_in_data(key, item)
                    if found is not None:
                        return found

        return None

    @staticmethod
    async def _find_all_values_in_data(key: str, data: Any) -> List[Any]:
        """在数据中查找所有匹配的键值（用于数组处理）"""
        results = []

        if isinstance(data, dict):
            # 如果键在当前层级，添加到结果
            if key in data:
                results.append(data[key])

            # 递归在嵌套字典中查找
            for value in data.values():
                if isinstance(value, (dict, list)):
                    results.extend(await IPostRequest._find_all_values_in_data(key, value))

        elif isinstance(data, list):
            # 在列表中查找所有匹配项
            for item in data:
                if isinstance(item, (dict, list)):
                    results.extend(await IPostRequest._find_all_values_in_data(key, item))

        return results
