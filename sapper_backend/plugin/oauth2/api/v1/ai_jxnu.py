#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Response
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64

from app.admin.schema.token import GetLoginToken
from common.enums import UserSocialType
from common.exception.errors import RequestError
from common.log import log
from common.response.response_schema import ResponseSchemaModel, response_base
from common.schema import SchemaBase
from core.conf import settings
from plugin.oauth2.service.oauth2_service import oauth2_service

router = APIRouter()


class JxnuLoginRequest(SchemaBase):
    token: str  # Encrypted token from frontend
    iv: str  # Initialization vector for decryption


def decrypt_token(encrypted_token: str, iv: str) -> Optional[str]:
    """
    Decrypt the token using AES-CBC with the provided IV
    Args:
        encrypted_token: Base64 encoded encrypted token
        iv: Hex encoded initialization vector
    Returns:
        Decrypted token string or None if decryption fails
    """
    try:
        if not settings.OAUTH2_AI_JXNU_AES_KEY:
            log.warning('AI JXNU OAuth is not configured')
            return None
        # Prepare the key and IV
        key = base64.b64decode(settings.OAUTH2_AI_JXNU_AES_KEY)
        iv_bytes = bytes.fromhex(iv)

        # Decode the encrypted token
        encrypted_bytes = base64.b64decode(encrypted_token)

        # Create cipher and decrypt
        cipher = AES.new(key, AES.MODE_CBC, iv_bytes)
        decrypted = cipher.decrypt(encrypted_bytes)

        # Remove padding and decode to string
        unpadded = unpad(decrypted, AES.block_size)
        return unpadded.decode('utf-8')
    except (ValueError, TypeError):
        log.warning('Failed to decrypt AI JXNU OAuth token')
        return None

async def get_jxnu_user_info(token: str) -> Optional[dict]:
    wx_api_url = f"{settings.OAuth2_AI_JXNU_URL}"

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(
                wx_api_url,
                headers={
                    "Accept": "application/json",
                    "User-Agent": "AI-Portal-Auth/1.0",
                    "Authorization": f"Bearer {token}"
                }
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"江西师大AI门户接口异常: HTTP {response.status_code}"
                )

            jxnu_data = response.json()
            if not isinstance(jxnu_data, dict):
                raise RequestError(msg="江西师大AI门户返回数据格式异常")
            user_uuid = jxnu_data["data"].get('username')
            if not user_uuid or not isinstance(user_uuid, str):
                raise RequestError(msg="无效的用户标识")
            user = jxnu_data.get("data", {})
            user["uuid"] = str(user.get("id"))
            return user

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="江西师大AI门户接口请求超时"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"江西师大AI门户接口网络错误: {str(e)}"
        )
    except json.JSONDecodeError:
        raise RequestError(msg="江西师大AI门户返回数据解析失败")

@router.post(
    '/jxnu-auth',
    summary='江西师大AI门户一键登录',
    response_description="授权成功返回用户凭证"
)
async def ai_jxnu_login(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    obj: JxnuLoginRequest
)-> ResponseSchemaModel[GetLoginToken]:
    """
    江西师大AI门户登录流程：
    1. 用密钥将token解密
    2. 用临时token换取 user_uuid
    3. 后续应创建自己的用户会话（示例仅返回江西师大AI门户数据）
    """
    # Step 1: Decrypt the token
    decrypted_token = decrypt_token(obj.token, obj.iv)
    if not decrypted_token:
        raise HTTPException(
            status_code=400,
            detail="Token解密失败，请检查参数"
        )
    user = await get_jxnu_user_info(decrypted_token)
    try:
        data = await oauth2_service.create_with_login(
            request=request,
            response=response,
            background_tasks=background_tasks,
            user=user,
            social=UserSocialType.jxnu_ai,
        )
        return response_base.success(data=data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"用户会话创建失败: {str(e)}"
        )
