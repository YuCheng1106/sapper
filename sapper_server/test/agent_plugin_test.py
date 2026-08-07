import json
import httpx
from httpx import Timeout
import asyncio

timeout = Timeout(60.0, read=360.0)


async def run_stream(api_data, query: list):
    """带动态参数处理的流式请求函数"""
    try:
        # 从 api_data 中提取服务端配置
        API_URL = api_data["server_url"]
        headers = {
            "Content-Type": api_data.get("content_type", "application/json"),
            "Authorization": api_data.get("authorization", "")
        }
        data = None

        # 动态处理请求参数
        if headers["Content-Type"] == "application/json":
            # 深拷贝参数并添加流式控制
            params = api_data["api_parameter"].copy()
            # params["stream"] = True
            params["message"] = query
            data = json.dumps(params)

        elif headers["Content-Type"] == "application/octet-stream":
            # 处理二进制文件流（根据实际业务需求实现）
            async with httpx.AsyncClient() as client:
                resp = await client.get(api_data["api_parameter"]["file_path"])
                data = resp.content

        # 发起流式请求
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", API_URL, headers=headers, data=data) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    line = line.strip()
                    if not line or line == "data: [DONE]":
                        continue
                    # 处理 SSE 格式数据
                    if line.startswith("data: "):
                        payload = json.loads(line[6:])
                        # print(payload)
                        # 使用动态路径解析内容
                        result = payload
                        for key in api_data["parse_path"]:
                            result = result.get(key, "")
                            if not result: break

                        # 返回有效内容
                        if result:
                            yield result

                        # 检查终止条件
                        if payload.get("choices") and payload["choices"][0].get("finish_reason") == "stop":
                            break

    except json.JSONDecodeError as e:
        raise RuntimeError(f"JSON解析失败: {str(e)}") from e
    except httpx.HTTPStatusError as e:
        raise RuntimeError(f"HTTP错误 {e.response.status_code}") from e
    except Exception as e:
        raise RuntimeError(f"请求异常: {str(e)}") from e

api_data = {
    "name": "科技人才画像智能体",
    "description": "整合多渠道人才数据（如论文、专利、科研项目等），构建动态更新的科技人才数字档案，生成多维技术标签与能力评估模型，实现人才与科研项目、团队需求的精准匹配。可预警人才流动风险，并为人才引进、培训规划及激励政策制定提供数据支持，提升科技人才管理的科学性与效率。",
    "cover_image": "",
    "status": 3,
    "id": 18,
    "uuid": "0990ee66-73d4-4469-933e-3ce6fa95eae1",
    "user_uuid": "af4c804f-3966-4949-ace2-3bb7416ea926",
    "server_url": "https://api.example.com/api/v1/sapper/agent/generate_answer/f9f0a450-7b67-4df4-b376-3f2963919341",
    "api_parameter": {
        "message": [{'type': 'text', 'content': '你好'}]
    },
    "parse_path": [
        "current_unit", "output", "content"
    ],
    "return_value_type": "Text",
    "content_type": "application/json",
    "authorization": "Bearer replace-with-your-test-token",
    "created_time": "2025-03-30T23:57:47",
    "updated_time": "2025-03-30T23:57:47"
}


# 模拟调用
async def main():
    async for chunk in run_stream(api_data, [{'type': 'text', 'content': '你好'}]):
        print(chunk, end="", flush=True)

# 运行测试

asyncio.run(main())
