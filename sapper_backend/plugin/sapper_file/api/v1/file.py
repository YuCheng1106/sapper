import uuid
from fastapi import APIRouter, File, UploadFile, Request
import os

from common.exception import errors
from pathlib import Path

from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from core.path_conf import UPLOAD_DIR
from plugin.sapper_file.schema.file import FileUploadRes
from plugin.sapper_file.service.file_service import cos_upload_file

# 创建一个路由器
router = APIRouter()


@router.post("/upload", dependencies=[DependsJwtAuth], summary="cos 文件上传")
async def upload_file(request: Request, file: UploadFile = File(...))-> ResponseSchemaModel[FileUploadRes]:
    # 将 UPLOAD_DIR 转换为 Path 对象
    upload_folder = Path(UPLOAD_DIR)

    # 生成一个 UUID 用作新文件夹的名称
    unique_id = str(uuid.uuid4())
    folder_path = upload_folder / request.user.uuid / unique_id

    # 创建新的文件夹
    folder_path.mkdir(parents=True, exist_ok=True)

    # 保存文件到指定的 UUID 文件夹中
    file_location = folder_path / file.filename

    try:
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # 上传到COS
        file_url = await cos_upload_file(file_location, file.filename)

        # 上传成功后删除本地文件
        if os.path.exists(file_location):
            os.remove(file_location)
            # 如果文件夹为空，也删除文件夹
            try:
                folder_path.rmdir()
            except OSError:
                pass

        return response_base.success(data=FileUploadRes(url=file_url))

    except Exception as e:
        # 如果发生错误，确保删除可能已创建的文件
        if 'file_location' in locals() and os.path.exists(file_location):
            os.remove(file_location)
        raise errors.RequestError(msg="文件上传失败")