# -*- coding=utf-8
# from qcloud_cos import CosConfig
# from qcloud_cos import CosS3Client
import sys
import logging
import os
import uuid


# 正常情况日志级别使用 INFO，需要定位时可以修改为 DEBUG，此时 SDK 会打印和服务端的通信信息
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

secret_id = os.getenv("SECRET_ID", "")
secret_key = os.getenv("SECRET_KEY", "")
region = os.getenv("REGION", "")

token = os.getenv("COS_SESSION_TOKEN", "")
scheme = 'https'

# config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key, Token=token, Scheme=scheme)
# client = CosS3Client(config)


def upload_file(path, name):  # 这些方法大差不差，注意Key是上传到腾讯云后的文件名，Body是本地文件名
    uuid4 = str(uuid.uuid4()) + "/" + name
    response = client.upload_file(
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
        Key=uuid4  # 上传到腾讯云后的对象键（在对象的访问域名 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/doc/pic.jpg 中，对象键为 doc/pic.jpg）
    )
    return url



# upload("MainFramework/TestData/Yishun Wu.png")
