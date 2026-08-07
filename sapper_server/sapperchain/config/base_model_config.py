import os
from typing import NamedTuple

class ModelConfigArgs(NamedTuple):
    api_key: str
    base_url: str
    uuid: str
    server_url: str
    model: str
    messages: list
    parse_path:list
    content_type: str
    authorization: str


class ModelConfig:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.uuid = "123456"
        self.server_url = f"{self.base_url.rstrip('/')}/chat/completions"
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.messages = []
        self.stream = True
        self.tool_model_output_parameters = [
            {
                "name": "choices",
                "description": "模型生成的文本内容",
                "type": "array",
                "enabled": True,
                "items": {
                    "name": "delta",
                    "description": "模型生成的文本内容",
                    "type": "object",
                    "enabled": True,
                    "properties": [
                        {
                            "name": "content",
                            "description": "模型生成的文本内容",
                            "type": "string",
                            "enabled": True,
                        }
                    ]
                },
            }
        ]
        self.mag_model_output_parameters = [
            {
                "name": "choices",
                "description": "模型生成的文本内容",
                "type": "array",
                "enabled": True,
            }
        ]
        self.tool_model_parse_path = ["choices",0,"delta","content"]
        self.mag_model_parse_path = ["choices", 0]
        self.return_value_type = "Text"
        self.method = "POST"
        self.headers = [
            {
                "name": "Content-Type",
                "value": "application/json",
            }
        ]
        self.auth_config = {
            "type": "bearer",
            "token": api_key,
        }
        self.request_body = {
            "mode": "raw",
            "content_type": "application/json",
        }


#     def setup_tool_model_args(self) -> ModelConfigArgs:
#             parser = argparse.ArgumentParser(description='model setting')
#             parser.add_argument("--api_key", type=str, default="replace-with-your-api-key", help='Radius of cylinder')
#             parser.add_argument("--base_url", type=str, default="https://api.example.com/v1",help="")
#             parser.add_argument("--uuid",type=str,default="123456")
#             parser.add_argument("--server_url",type=str,default="https://api.example.com/v1/chat/completions")
#             parser.add_argument("--model",type=str, default="gpt-4o")
#             parser.add_argument("--messages",type=list,default=[])
#             parser.add_argument("--parse_path",type=list, default=["choices",0,"delta","content"])
#             parser.add_argument("--content_type",type=str,default='application/json')
#             parser.add_argument("--authorization",type=str,default=f"Bearer replace-with-your-test-token")
#             return ModelConfigArgs(**vars(parser.parse_args()))
#
#
#     def setup_mag_model_args(self) ->ModelConfigArgs:
#         parser = argparse.ArgumentParser(description='model setting')
#         parser.add_argument("--api_key", type=str, default="replace-with-your-api-key",
#                             help='Radius of cylinder')
#         parser.add_argument("--base_url", type=str, default="https://api.example.com/v1", help="")
#         parser.add_argument("--uuid", type=str, default="123456")
#         parser.add_argument("--server_url", type=str, default="https://api.example.com/v1/chat/completions")
#         parser.add_argument("--model", type=str, default="gpt-4o")
#         parser.add_argument("--messages", type=list, default=[])
#         parser.add_argument("--parse_path", type=list, default=["choices", 0])
#         parser.add_argument("--content_type", type=str, default='application/json')
#         parser.add_argument("--authorization", type=str,
#                             default=f"Bearer replace-with-your-test-token")
#         return ModelConfigArgs(**vars(parser.parse_args()))
#
# tool_model_args = setup_tool_model_args()
# mag_model_args = setup_mag_model_args()



