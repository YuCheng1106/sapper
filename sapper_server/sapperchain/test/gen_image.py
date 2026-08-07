import tempfile

import requests
import json

url = "https://api.example.com/v1/images/generations"

payload = json.dumps({
   "model": "gpt-image-1",
   "prompt": "一幅详细的图像描绘了一个广阔的石器时代城市，城市中高耸的摩天大楼由巨石和骨头构成。这里热闹非凡，各种性别和种族的人们共同展现出原始人和原始女性的统一外貌。他们身穿商务服装，与史前背景形成鲜明对比。化石化的塔楼点缀着石质天际线，而人们则保留着原始的设计，身上披着毛皮，搭配现代的西装和领带。形成了现代生活与史前时代的美丽融合。",
   "n": 1,
   "quality": "medium",
   "size": "1024x1024"
})
headers = {
   'Authorization': 'Bearer replace-with-your-test-token',
   'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)
# 检查请求是否成功
if response.status_code == 200:
    # 获取内容类型来判断音频格式
    content_type = response.headers.get('content-type', '')

    file_extension = '.png'

    # 创建临时文件
    with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as temp_file:
        # 直接将二进制内容写入临时文件
        print(response.content)
        temp_file.write(response.content)
        filename = temp_file.name

    print(f"音频文件已保存为: {filename}")
    print(f"文件大小: {len(response.content)} 字节")

    # 这里你可以使用 filename 进行后续操作
    # 临时文件会在程序结束后自动删除，或者你可以手动删除

else:
    print(f"请求失败，状态码: {response.status_code}")
    print(f"错误信息: {response.text}")
