import aiohttp
import asyncio
from typing import Dict, Callable, Optional

from common.log import log
from core.conf import settings


class RobotService:
    def __init__(self, base_url: str | None = None, token: str | None = None):
        self.base_url = (base_url or settings.ROBOT_SERVICE_URL).rstrip('/')
        self.token = token or settings.ROBOT_SERVICE_TOKEN
        self._session: Optional[aiohttp.ClientSession] = None

    @property
    async def session(self) -> aiohttp.ClientSession:
        """获取或创建 aiohttp session"""
        if self._session is None or self._session.closed:
            headers = {'Content-Type': 'application/json'}
            if self.token:
                headers['Authorization'] = f'Bearer {self.token}'
            self._session = aiohttp.ClientSession(
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            )
        return self._session

    async def close(self):
        """关闭 session"""
        if self._session and not self._session.closed:
            await self._session.close()

    async def add_model(self, callback: Callable = None, robot_config: Dict = None, robot_id: str = None):
        """
        添加模型（异步版本）

        Args:
            robot_config: 包含模型类型、提供商代码和表单数据的参数字典
            callback: 成功回调函数
            robot_id: 成功回调函数
        """

        # 请求数据
        post_data = {
            "isDefault": 1,
            "isEnabled": 1,
            "configJson": robot_config,
            "modelName": robot_config.get("model_name"),
        }

        # API端点
        url = f"{self.base_url}/xiaozhi/agent/sapper/{robot_id}"

        try:
            # 获取 session
            session = await self.session

            # 发送异步 POST 请求
            async with session.post(url=url, json=post_data) as response:

                # 请求成功
                if response.status == 200:
                    result = await response.json()
                    if callback:
                        # 如果回调函数是异步的，使用 await
                        if asyncio.iscoroutinefunction(callback):
                            await callback(result)
                        else:
                            callback(result)
                    return result
                else:
                    # 请求失败
                    error_msg = f"请求失败，状态码: {response.status}"
                    try:
                        error_data = await response.json()
                        error_msg = error_data.get('msg', error_msg)
                    except (aiohttp.ContentTypeError, ValueError):
                        pass

                    log.warning('Failed to add robot model: HTTP {}', response.status)
                    # 这里可以添加重试逻辑
                    # await self._retry_request(url, post_data, callback)
                    return {'success': False, 'msg': error_msg}

        except aiohttp.ClientError as err:
            # 网络异常
            log.warning('Robot service network error: {}', type(err).__name__)
            return {'success': False, 'msg': f'网络错误: {str(err)}'}
        except Exception as err:
            # 其他异常
            log.exception('Unexpected robot service error')
            return {'success': False, 'msg': f'异常: {str(err)}'}

    async def _retry_request(self, url: str, data: Dict, callback: Callable, max_retries: int = 3):
        """
        重试请求（异步版本）
        """
        for attempt in range(max_retries):
            try:
                session = await self.session
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        if callback:
                            if asyncio.iscoroutinefunction(callback):
                                await callback(result)
                            else:
                                callback(result)
                        return result
            except aiohttp.ClientError:
                if attempt == max_retries - 1:
                    log.warning('Robot service failed after {} retries', max_retries)
                    return {'success': False, 'msg': '重试多次后仍然失败'}
            # 等待一段时间后重试
            await asyncio.sleep(1 * (attempt + 1))

    async def get_service_url(self) -> str:
        """获取服务URL"""
        return f"{self.base_url}/xiaozhi/agent/sapper/{settings.ROBOT_DEFAULT_ID}"

    # 支持异步上下文管理器
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


# 创建全局实例
robot_service = RobotService()
