import base64
import hashlib
import hmac
import json
import os
import time
import requests
import urllib

from common.log import log

# 直接使用原始代码中的类定义
class RequestApi:
    def __init__(self, appid, secret_key):
        self.appid = appid
        self.secret_key = secret_key

    def get_signa(self):
        self.ts = str(int(time.time()))
        m2 = hashlib.md5()
        m2.update((self.appid + self.ts).encode('utf-8'))
        md5 = m2.hexdigest()
        md5 = bytes(md5, encoding='utf-8')
        signa = hmac.new(self.secret_key.encode('utf-8'), md5, hashlib.sha1).digest()
        signa = base64.b64encode(signa)
        return str(signa, 'utf-8')

    def upload(self, file_path):
        file_len = os.path.getsize(file_path)
        file_name = os.path.basename(file_path)

        param_dict = {
            'appId': self.appid,
            'signa': self.get_signa(),
            'ts': self.ts,
            "fileSize": file_len,
            "fileName": file_name,
            "duration": "200",
            "roleType": 1
        }

        with open(file_path, 'rb') as f:
            response = requests.post(
                url='https://raasr.xfyun.cn/v2/api/upload?' + urllib.parse.urlencode(param_dict),
                headers={"Content-type": "application/octet-stream"},
                data=f
            )

        return response.json()

    def get_result(self, order_id):
        param_dict = {
            'appId': self.appid,
            'signa': self.get_signa(),
            'ts': self.ts,
            'orderId': order_id,
            'resultType': "transfer"
        }

        while True:
            response = requests.post(
                url='https://raasr.xfyun.cn/v2/api/getResult?' + urllib.parse.urlencode(param_dict),
                headers={"Content-type": "application/json"}
            )
            result = response.json()
            log.debug('Speech transcription task submitted')
            if result['content']['orderInfo']['status'] == 4:
                break
            time.sleep(5)

        return result


    def extract_dialogue_text(self, json_data):
        """完全保持原始提取方法"""
        try:
            if isinstance(json_data['content']['orderResult'], str):
                order_result = json.loads(json_data['content']['orderResult'])
            else:
                order_result = json_data['content']['orderResult']

            lattice = sorted(order_result['lattice'], key=lambda x: int(json.loads(x['json_1best'])['st']['bg']))

            dialogue_lines = []
            current_role = None

            for item in lattice:
                if isinstance(item['json_1best'], str):
                    json_1best = json.loads(item['json_1best'])
                else:
                    json_1best = item['json_1best']

                st = json_1best['st']
                role = st['rl']
                rt = st['rt'][0]
                words = []
                for ws in rt['ws']:
                    for cw in ws['cw']:
                        words.append(cw['w'])
                text = ''.join(words).strip()

                if not text:
                    continue

                if role != current_role:
                    dialogue_lines.append(f"角色{role}：{text}")
                    current_role = role
                else:
                    if dialogue_lines and dialogue_lines[-1].startswith(f"角色{role}："):
                        dialogue_lines[-1] = dialogue_lines[-1] + text
                    else:
                        dialogue_lines.append(f"角色{role}：{text}")

            return '\n'.join(dialogue_lines)
        except (KeyError, json.JSONDecodeError) as e:
            return f"Error parsing result: {str(e)}"


# 初始化API处理器
api_processor = RequestApi(
    appid="ecbe2843",
    secret_key=os.getenv("XFYUN_SECRET_KEY", ""),
)


async def audio_to_text(audio_path):
    # 1. 上传文件
    upload_result = api_processor.upload(audio_path)
    order_id = upload_result['content']['orderId']

    # 2. 获取转写结果
    result = api_processor.get_result(order_id)

    # 3. 提取对话文本
    transcript = api_processor.extract_dialogue_text(result)
    return transcript
#
# async def main():
#     # 图片路径
#     image_path = r"D:\workspace\agent_dy\sapper_server\test\input\测试2.mp3"
#     content = await audio_to_text(image_path)
#     print(content)
#
# # 运行异步主函数
# if __name__ == "__main__":
#     asyncio.run(main())
