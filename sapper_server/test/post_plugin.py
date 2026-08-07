import requests
import json

# API 配置
api_url = "https://example.com:8025/api/v1/custom-plugin/markdown-2-image"
headers = {
    "Content-Type": "application/json"
}
# 如果需要授权，可以在这里添加 Authorization 头
# headers["Authorization"] = "your_token_here"

# 要转换的 Markdown 内容
markdown_content = """
# 这是一个标题

这是一个段落，**加粗文本**，*斜体文本*。

- 列表项1
- 列表项2
"""

# 构造请求数据
data = {
    "content": markdown_content
}

try:
    # 发送 POST 请求
    response = requests.post(api_url, headers=headers, data=json.dumps(data))

    # 检查响应状态
    if response.status_code == 200:
        # 解析响应数据
        response_data = response.json()

        # 根据文档，图片URL在 data.url 路径下
        image_url = response_data.get("data", {}).get("url")

        if image_url:
            print("转换成功！图片URL:", image_url)
        else:
            print("响应中未找到图片URL")
    else:
        print(f"请求失败，状态码: {response.status_code}")
        print("响应内容:", response.text)

except Exception as e:
    print("发生错误:", str(e))
