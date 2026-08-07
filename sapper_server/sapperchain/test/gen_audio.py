import tempfile
import requests
import json

url = "https://api.example.com/v1/audio/speech"

payload = json.dumps({
    "model": "gpt-4o-mini-tts",
    "extra_body": {
        "prompt": "alloy",
        "temperature": 0.2,
        "top_K": 20
    },
    "voice": "alloy",
    "input": "您好，我是vapi的 TTS小助理，感谢体验我们的API服务！"
})
headers = {
    'Accept': '*/*',
    'Authorization': 'Bearer replace-with-your-test-token',
    'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

# 检查请求是否成功
if response.status_code == 200:
    # 获取内容类型来判断音频格式
    content_type = response.headers.get('content-type', '')

    # 根据内容类型确定文件扩展名
    if 'mp3' in content_type:
        file_extension = '.mp3'
    elif 'wav' in content_type:
        file_extension = '.wav'
    elif 'ogg' in content_type:
        file_extension = '.ogg'
    else:
        # 默认使用 mp3
        file_extension = '.mp3'

    # 创建临时文件
    with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as temp_file:
        # 直接将二进制内容写入临时文件
        temp_file.write(response.content)
        filename = temp_file.name

    print(f"音频文件已保存为: {filename}")
    print(f"文件大小: {len(response.content)} 字节")

    # 这里你可以使用 filename 进行后续操作
    # 临时文件会在程序结束后自动删除，或者你可以手动删除

else:
    print(f"请求失败，状态码: {response.status_code}")
    print(f"错误信息: {response.text}")
