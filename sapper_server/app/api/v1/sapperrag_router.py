#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter, Request, UploadFile, File, HTTPException
import logging
import tempfile
import os
from app.conf import admin_settings
from fastapi.encoders import jsonable_encoder
import aiohttp
import aiofiles
from app.schema.sapperrag_schema import KnowledgeRetrivalParam, ContentEmbeddingParam, FileReadingParam, \
    FileEmbeddingParam
from sapperrag import ChunkEmbedder, TextFileChunker, DocumentReader
from sapperrag.embedding import LocalModelEmbedding
from sapperrag.model import TextChunk
from pathlib import Path
logger = logging.getLogger(__name__)
router = APIRouter()


async def download_file(url: str, save_path: Path):
    """
    异步下载文件到本地
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise HTTPException(
                    status_code=response.status,
                    detail=f"文件下载失败，状态码: {response.status}"
                )

            async with aiofiles.open(save_path, 'wb') as f:
                while True:
                    chunk = await response.content.read(1024 * 1024)  # 1MB chunks
                    if not chunk:
                        break
                    await f.write(chunk)


@router.post("/read")
async def read_file(request: Request, obj: FileReadingParam):
    """
    读取远程文件内容并返回解析结果

    参数:
    - file_url: 文件URL地址
    """
    temp_dir = None
    try:
        # 验证文件URL
        if not obj.file_url or not obj.file_url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="无效的文件URL")

        # 创建临时目录
        temp_dir = tempfile.mkdtemp(prefix="file_reader_")
        logger.debug(f"创建临时目录: {temp_dir}")

        # 从URL获取文件名
        file_name = Path(obj.file_url).name
        if not file_name:
            raise HTTPException(status_code=400, detail="无法从URL提取文件名")

        temp_file_path = Path(temp_dir) / file_name

        # 下载文件
        await download_file(obj.file_url, temp_file_path)
        logger.debug(f"文件下载完成: {temp_file_path}")

        # 读取文件内容
        local_file_reader = DocumentReader()
        read_result = local_file_reader.read(temp_file_path.parent)  # 传入目录路径

        return {"read_result": read_result}

    except HTTPException:
        raise
    except aiohttp.ClientError as e:
        logger.error(f"文件下载失败: {e}")
        raise HTTPException(status_code=502, detail=f"文件下载失败: {str(e)}")
    except Exception as e:
        logger.exception(f"处理文件时发生意外错误: {e}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")
    finally:
        # 清理临时目录
        if temp_dir and Path(temp_dir).exists():
            try:
                for f in Path(temp_dir).glob("*"):
                    f.unlink()
                Path(temp_dir).rmdir()
                logger.debug(f"已清理临时目录: {temp_dir}")
            except Exception as e:
                logger.warning(f"清理临时目录失败: {e}")


@router.post("/embedding")
async def embedding_file(request: Request, obj: FileEmbeddingParam):
    temp_dir = None
    try:
        # 1. 验证输入参数
        if not obj.file_url or not obj.file_url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="无效的文件URL")

        # 2. 创建临时目录
        temp_dir = tempfile.mkdtemp(prefix="embedding_")
        logger.info(f"创建临时目录: {temp_dir}")

        # 3. 下载文件
        file_name = Path(obj.file_url).name
        if not file_name:
            raise HTTPException(status_code=400, detail="无法从URL提取文件名")

        temp_file_path = Path(temp_dir) / file_name
        await download_file(obj.file_url, temp_file_path)
        logger.info(f"文件下载完成: {temp_file_path}")

        # 4. 读取文件内容
        local_file_reader = DocumentReader()
        read_result = local_file_reader.read(temp_file_path.parent)
        if not read_result:
            raise HTTPException(status_code=400, detail="文件内容为空或读取失败")

        # 5. 文本分块
        text_file_chunker = TextFileChunker(
            chunk_type='regex',
        )
        chunk_result = text_file_chunker.chunk(read_result)
        logger.info(f"文本分块完成，共 {len(chunk_result)} 块")
        # 6. 初始化嵌入模型
        embeder = LocalModelEmbedding(admin_settings.EMBEDDING_MODEL_PATH)
        await embeder.wait_for_model_to_load()
        logger.info("嵌入模型加载完成")

        # 使用 ChunkEmbedder 对分块后的文本进行嵌入
        chunk_embedder = ChunkEmbedder(embeder)
        embed_result = chunk_embedder.embed(chunk_result)
        return {"embed_result": jsonable_encoder(embed_result)}

    except HTTPException:
        raise

    except aiohttp.ClientError as e:
        logger.error(f"文件下载失败: {e}")
        raise HTTPException(status_code=502, detail=f"文件下载失败: {str(e)}")

    except Exception as e:
        logger.exception(f"处理文件时发生意外错误: {e}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

    finally:
        # 清理临时目录
        if temp_dir and Path(temp_dir).exists():
            try:
                for f in Path(temp_dir).glob("*"):
                    f.unlink()
                Path(temp_dir).rmdir()
                logger.info(f"已清理临时目录: {temp_dir}")
            except Exception as e:
                logger.warning(f"清理临时目录失败: {e}")


@router.post("/chunk")
async def chunk_file(request: Request, obj: FileEmbeddingParam):
    temp_dir = None
    try:
        # 1. 验证输入参数
        if not obj.file_url or not obj.file_url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="无效的文件URL")

        # 2. 创建临时目录
        temp_dir = tempfile.mkdtemp(prefix="embedding_")
        logger.info(f"创建临时目录: {temp_dir}")

        # 3. 下载文件
        file_name = Path(obj.file_url).name
        if not file_name:
            raise HTTPException(status_code=400, detail="无法从URL提取文件名")

        temp_file_path = Path(temp_dir) / file_name
        await download_file(obj.file_url, temp_file_path)
        logger.info(f"文件下载完成: {temp_file_path}")

        # 4. 读取文件内容
        local_file_reader = DocumentReader()
        read_result = local_file_reader.read(temp_file_path.parent)
        if not read_result:
            raise HTTPException(status_code=400, detail="文件内容为空或读取失败")

        # 5. 文本分块
        text_file_chunker = TextFileChunker(
            chunk_type='regex',
        )
        chunk_result = text_file_chunker.chunk(read_result)
        logger.info(f"文本分块完成，共 {len(chunk_result)} 块")
        return {"chunk_result": jsonable_encoder(chunk_result)}

    except HTTPException:
        raise

    except aiohttp.ClientError as e:
        logger.error(f"文件下载失败: {e}")
        raise HTTPException(status_code=502, detail=f"文件下载失败: {str(e)}")

    except Exception as e:
        logger.exception(f"处理文件时发生意外错误: {e}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

    finally:
        # 清理临时目录
        if temp_dir and Path(temp_dir).exists():
            try:
                for f in Path(temp_dir).glob("*"):
                    f.unlink()
                Path(temp_dir).rmdir()
                logger.info(f"已清理临时目录: {temp_dir}")
            except Exception as e:
                logger.warning(f"清理临时目录失败: {e}")


@router.post("/content-embedding")
async def embedding_content(request: Request, obj: ContentEmbeddingParam):
    try:
        chunk_result = [TextChunk(id='1', short_id='1', text=obj.content)]
        # 初始化本地嵌入模型
        embeder = LocalModelEmbedding(admin_settings.EMBEDDING_MODEL_PATH)
        await embeder.wait_for_model_to_load()

        # 使用 ChunkEmbedder 对分块后的文本进行嵌入
        chunk_embedder = ChunkEmbedder(embeder)
        embed_result = chunk_embedder.embed(chunk_result)
        # print(embed_result)
        return {"embed_result": jsonable_encoder(embed_result)}

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))
