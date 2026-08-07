import requests
import json
import os


class ChatAPITester:
    def __init__(self, base_url="http://172.22.9.3:7012/v1/open/noauth/assist/chat"):
        self.base_url = base_url
        self.token = os.getenv("TEST_CHAT_TOKEN", "")
        self.headers = {"Content-Type": "application/json"}

    def send_request(self, query, conversation_id=None, files=None, stream=False):
        """
        发送请求到Chat API
        :param query: 问题内容
        :param conversation_id: 会话ID（可选）
        :param files: 文件列表（可选）
        :param stream: 是否流式返回
        :return: 响应内容
        """
        payload = {
            "query": query,
            "token": self.token,
            "stream": stream
        }

        if conversation_id:
            payload["conversation_id"] = conversation_id

        if files:
            payload["files"] = files

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                stream=stream
            )

            if stream:
                # 处理流式响应
                for line in response.iter_lines():
                    if line:
                        decoded_line = line.decode('utf-8')
                        try:
                            # 尝试解析为JSON
                            data = json.loads(decoded_line)
                            print(f"Stream Response: {data}")
                        except json.JSONDecodeError:
                            # 非JSON数据（如ping/pong）
                            print(f"Non-JSON Data: {decoded_line}")
            else:
                # 处理非流式响应
                return response.json()

        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_text_query(self):
        """测试纯文本查询"""
        query = "鸳鸯有哪些特征？"
        print("\nTesting text query with streaming...")
        self.send_request(query, stream=True)

    def test_with_image_url(self):
        """测试带图片URL的查询"""
        print("\nTesting with image URL...")
        query = "请描述这张图片中的内容"
        files = [{
            "type": "image",
            "url": "https://example.com/sample.jpg"  # 替换为实际图片URL
        }]
        response = self.send_request(query, files=files, stream=False)
        print("Response with image URL:", response)

    def test_with_image_base64(self):
        """测试带Base64图片的查询"""
        print("\nTesting with Base64 image...")
        # 这里应该是实际的Base64编码图片数据，示例中为缩短省略
        base64_data = "data:image/png;base64,UklGRrZLAABXRUJ..."
        query = "请描述这张图片中的内容"
        files = [{
            "type": "image",
            "url": base64_data
        }]
        response = self.send_request(query, files=files, stream=False)
        print("Response with Base64 image:", response)


if __name__ == "__main__":
    tester = ChatAPITester()

    # 运行测试案例
    tester.test_text_query()
    # tester.test_with_image_url()
    # tester.test_with_image_base64()
