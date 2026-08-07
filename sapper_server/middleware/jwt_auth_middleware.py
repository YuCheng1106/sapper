#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from typing import Any

from fastapi import Request, Response
from fastapi.security.utils import get_authorization_scheme_param
from pydantic_core import from_json
from starlette.authentication import AuthCredentials, AuthenticationBackend, AuthenticationError, BaseUser
from starlette.requests import HTTPConnection

from common.exception.errors import TokenError
from common.log import log
from common.security import jwt
from core.conf import settings
from utils.serializers import MsgSpecJSONResponse, select_as_dict


class _AuthenticationError(AuthenticationError):
    """重写内部认证错误类"""

    def __init__(self, *, code: int = None, msg: str = None, headers: dict[str, Any] | None = None):
        self.code = code
        self.msg = msg
        self.headers = headers


class JwtAuthMiddleware(AuthenticationBackend):
    """JWT 认证中间件"""

    def convert_path_to_regex(self, path: str) -> str:
        """
        将路径模式转换为正则表达式，例如:
        `/api/v1/sys/announcement/info/:id` -> `/api/v1/sys/announcement/info/[^/]+`
        """
        return re.sub(r':\w+', r'[^/]+', path)

    def is_path_excluded(self, request: HTTPConnection) -> bool:
        method = request.scope.get("method", "GET")
        path = request.scope.get("path", "/")
        for raw_path_pattern, allowed_method in settings.TOKEN_REQUEST_PATH_EXCLUDE:
            # 将路径模式转换为正则表达式
            regex_path = self.convert_path_to_regex(raw_path_pattern)

            # 匹配路径和方法
            if re.fullmatch(regex_path, path) and (allowed_method == method or allowed_method == "*"):
                return True

        return False

    @staticmethod
    def auth_exception_handler(conn: HTTPConnection, exc: _AuthenticationError) -> Response:
        """覆盖内部认证错误处理"""
        return MsgSpecJSONResponse(content={'code': exc.code, 'msg': exc.msg, 'data': None}, status_code=exc.code)

    async def authenticate(self, request: Request) -> tuple[AuthCredentials] | None:
        return
        # if self.is_path_excluded(request):
        #     return
        #
        # token = request.headers.get('Authorization')
        #
        # if not token:
        #     return
        #
        # if request.url.path in settings.TOKEN_REQUEST_PATH_EXCLUDE:
        #     return
        #
        # scheme, token = get_authorization_scheme_param(token)
        # if scheme.lower() != 'bearer':
        #     return

        # try:
        #     sub = await jwt.jwt_authentication(token)
            # cache_user = await redis_client.get(f'{settings.JWT_USER_REDIS_PREFIX}:{sub}')
            # cache_user = False
            # if not cache_user:
            #     async with async_db_session() as db:
            #         current_user = await jwt.get_current_user(db, sub)
            #         user = CurrentUserIns(**select_as_dict(current_user))
            #         # await redis_client.setex(
            #         #     f'{settings.JWT_USER_REDIS_PREFIX}:{sub}',
            #         #     settings.JWT_USER_REDIS_EXPIRE_SECONDS,
            #         #     user.model_dump_json(),
            #         # )
            # else:
            #     # TODO: 在恰当的时机，应替换为使用 model_validate_json
            #     # https://docs.pydantic.dev/latest/concepts/json/#partial-json-parsing
            #     user = CurrentUserIns.model_validate(from_json(cache_user, allow_partial=True))
        #     return
        # except TokenError as exc:
        #     raise _AuthenticationError(code=exc.code, msg=exc.detail, headers=exc.headers)
        # except Exception as e:
        #     log.error(f'JWT 授权异常：{e}')
        #     raise _AuthenticationError(code=getattr(e, 'code', 500), msg=getattr(e, 'msg', 'Internal Server Error'))

        # user = CurrentUserIns(uuid='', id="")
        # 请注意，此返回使用非标准模式，所以在认证通过时，将丢失某些标准特性
        # 标准返回模式请查看：https://www.starlette.io/authentication/

        # return AuthCredentials(['authenticated']), user
