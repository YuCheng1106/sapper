import asyncio
from sapperchain.data_model.statement import APIInput
from sapperchain.utils.post_request import IPostRequest

plugin_config1 = {
  "name": "天气查询",
  "description": "根据城市查询天气",
  "server_url": "https://apis.juhe.cn/simpleWeather/query",
  "method": "GET",
  "input_data":
      {
          "city": "北京"
      }
  ,
  "input_parameters": [
    {
      "name": "city",
      "description": "城市名称",
      "type": "string",
      "location": "query",
      "required": True,
      "default": "北京"
    }
  ],
  "auth_config": {
    "type": "apikey",
    "api_key_location": "query",
    "api_key_name": "key",
    "api_key": "8ecd33942d9fdb7553a74a40e82e990a",
    "sub_type": "token/api_key",
  },
  "output_parameters": [
    {
      "name": "result",
      "description": "结果",
      "type": "object",
      "enabled": True,
    }
  ],
  "headers": [
        {
            "name": "User-Agent",
            "value": "Coze/1.0",
        },
        {
            "name": "Accept",
            "value": "application/json",
        }
    ]
}

plugin_config = {
    "name": "天气查询",
    "description": "根据城市查询天气",
    "server_url": "https://api.example.com/v1/chat/completions",
    "method": "POST",
    "input_data":
        {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "你是个有用的助手"
                },
                {
                    "role": "user",
                    "content": "你好"
                }
            ]
        }
    ,
    "input_parameters": [
    ],
    "auth_config": {
        "type": "bearer",
        "token": "replace-with-your-api-key"
    },
    "output_parameters": [
        {
            "name": "choices",
            "description": "模型生成的文本内容",
            "type": "array",
            "enabled": True,
            # "items": {
            #     "name": "delta",
            #     "description": "模型生成的文本内容",
            #     "type": "object",
            #     "enabled": True,
            #     "properties": [
            #         {
            #             "name": "content",
            #             "description": "模型生成的文本内容",
            #             "type": "string",
            #             "enabled": True,
            #         }
            #     ]
            # },
        }
    ],
    "headers": [
        {
            "name": "Accept",
            "value": "application/json",
        }
    ],
    "request_body": {
        "mode": "raw",
        "content_type": "application/json",
    },
    "stream": True
}

plugin_config2 = {
    "name": "天气查询",
    "description": "根据城市查询天气",
    "server_url": "http://localhost:8000/api/v1/sapper/sapperchain/6f926ad1-8e9b-495f-a0a3-fbc783e76c36/run",
    "method": "POST",
    "input_data":
        {
            "query": "高锰酸钾化学实验"
        }
    ,
    "input_parameters": [
        {
            "name": "query",
            "description": "发送的消息",
            "type": "string",
            "location": "body",
            "required": True,
            "default": "${UserRequest}$"
        }
    ],
    "auth_config": {
        "type": "bearer",
        "token": "replace-with-your-test-token"
    },
    "output_parameters": [
        {
            "name": "current_unit",
            "description": "结果",
            "type": "object",
            "enabled": True,
            "properties": [
                {
                    "name": "output",
                    "description": "结果",
                    "type": "object",
                    "enabled": True,
                    "properties": [
                        {
                            "name": "content",
                            "description": "结果",
                            "type": "string",
                            "enabled": True
                        }
                    ]
                }
            ]
        }
    ],
    "headers": [
        {
            "name": "Accept",
            "value": "application/json",
        }
    ],
    "request_body": {
        "mode": "raw",
        "content_type": "application/json",
    },
    "stream": True
}

plugin_config3 = {
    "name": "ChatTTS文本转语音",
    "description": "ChatTTS文本转语音",
    "server_url": "https://api.example.com/v1/audio/speech",
    "method": "POST",
    "input_parameters": [
        {
          "name": "input",
          "description": "需要转语音的文字",
          "type": "string",
          "location": "body",
          "required": True,
          "default": "您好，我是vapi的 TTS小助理，感谢体验我们的API服务！"
        },
        {
          "name": "model",
          "description": "转语音用的模型，固定为gpt-4o-mini-tts",
          "type": "string",
          "location": "body",
          "required": True,
          "default": "gpt-4o-mini-tts"
        },
        {
          "name": "voice",
          "description": "转语音的音色，只能从下面参数选择'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'coral'",
          "type": "string",
          "location": "body",
          "required": True,
          "default": "alloy"
        }
    ],
    "auth_config": {
        "type": "bearer",
        "token": "replace-with-your-api-key"
    },
    "output_parameters": [],
    "headers": [
        {
            "name": "Accept",
            "value": "application/json"
        }
    ],
    "request_body": {
        "mode": "raw",
        "content_type": "application/json"
    },
}

plugin_config4 = {
    "name": "gpt文本转图片",
    "description": "gpt文本转图片",
    "server_url": "https://api.example.com/v1/images/generations",
    "method": "POST",
    "input_data": {
       "model": "gpt-image-1",
       "prompt": "一幅详细的图像描绘了一个广阔的石器时代城市，城市中高耸的摩天大楼由巨石和骨头构成。这里热闹非凡，各种性别和种族的人们共同展现出原始人和原始女性的统一外貌。他们身穿商务服装，与史前背景形成鲜明对比。化石化的塔楼点缀着石质天际线，而人们则保留着原始的设计，身上披着毛皮，搭配现代的西装和领带。形成了现代生活与史前时代的美丽融合。",
       "n": 1,
       "quality": "medium",
       "size": "1024x1024"
    },
    "input_parameters": [
        {
          "name": "prompt",
          "description": "对需要生成的图片的文字描述",
          "type": "string",
          "location": "body",
          "required": True,
          "default": ""
        },
        {
          "name": "model",
          "description": "转图片用的模型，固定为gpt-image-1",
          "type": "string",
          "location": "body",
          "required": True,
          "default": "gpt-image-1"
        },
        {
          "name": "size",
          "description": "图片的大小 1024x1024、1024x1536、1536x1024、auto。如果没有指定默认为auto",
          "type": "string",
          "location": "body",
          "required": True,
          "default": "auto"
        }
    ],
    "auth_config": {
        "type": "bearer",
        "token": "replace-with-your-api-key"
    },
    "output_parameters": [
        {
            "name": "data",
            "description": "模型生成的图片链接",
            "type": "object",
            "enabled": True,
            "properties": [
                {
                    "name": "b64_json",
                    "description": "模型生成的图片链接",
                    "type": "string",
                    "enabled": True,
                }
            ]
        }
    ],
    "headers": [
        {
            "name": "Accept",
            "value": "application/json"
        }
    ],
    "request_body": {
        "mode": "raw",
        "content_type": "application/json"
    },
    "return_value_type": "image_base64"
}

plugin_config5 = {
    "name": "md转图片",
    "description": "md转图片",
    "server_url": "https://example.com:8025/api/v1/custom-plugin/markdown-2-image",
    "method": "POST",
    "input_data": {
       "content": "一幅详细的图像描绘了一个广阔的石器时代城市，城市中高耸的摩天大楼由巨石和骨头构成。这里热闹非凡，各种性别和种族的人们共同展现出原始人和原始女性的统一外貌。他们身穿商务服装，与史前背景形成鲜明对比。化石化的塔楼点缀着石质天际线，而人们则保留着原始的设计，身上披着毛皮，搭配现代的西装和领带。形成了现代生活与史前时代的美丽融合。",
    },
    "input_parameters": [
        {
          "name": "content",
          "description": "对需要生成的图片的文字描述",
          "type": "string",
          "location": "body",
          "required": True,
          "default": ""
        }
    ],
    "output_parameters": [
        {
            "name": "data",
            "description": "模型生成的图片链接",
            "type": "object",
            "enabled": True,
            "properties": [
                {
                    "name": "url",
                    "description": "模型生成的图片链接",
                    "type": "string",
                    "enabled": True,
                }
            ]
        }
    ],
    "headers": [
        {
            "name": "Accept",
            "value": "application/json"
        }
    ],
    "request_body": {
        "mode": "raw",
        "content_type": "application/json"
    },
    "return_value_type": "image"
}

async def example_usage():
    """使用示例"""
    # 创建一个插件配置实例
    plugin = APIInput(**plugin_config5)
    # 执行请求
    async for res in IPostRequest.post_plugin_request(plugin):
        print(res)

# 正确调用异步函数
if __name__ == "__main__":
    asyncio.run(example_usage())
