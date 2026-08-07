# -*- coding=utf-8
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import sys
import logging
import uuid
from core.conf import settings


logging.basicConfig(level=logging.INFO, stream=sys.stdout)

secret_id = settings.SECRET_ID
secret_key = settings.SECRET_KEY
region = settings.REGION

token = None
scheme = 'https'

config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key, Token=token, Scheme=scheme)
client = CosS3Client(config)


async def cos_upload_file(path, name):
    uuid4 = str(uuid.uuid4()) + "/" + name
    client.upload_file(
        Bucket='sapper3701-1316534880',
        LocalFilePath=path,
        Key=uuid4,
        PartSize=1,
        MAXThread=10,
        EnableMD5=False
    )
    # 获取上传文件的访问链接
    url = client.get_object_url(
        Bucket='sapper3701-1316534880',
        Key=uuid4
    )
    return url


async def cos_delete_file_by_url(url):
    response = client.delete_object(
        Bucket='sapper3701-1316534880',
        Key=url
    )
    # print(response['ETag'])


# upload("MainFramework/TestData/Yishun Wu.png")
