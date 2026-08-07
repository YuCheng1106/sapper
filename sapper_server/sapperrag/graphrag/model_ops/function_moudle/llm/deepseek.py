from ...base_model import BaseChatModel, BaseImageModel, BaseEmbeddingModel, BaseAudioModel
import requests
from openai import OpenAI


class ChatModel(BaseChatModel):
    def __init__(self, base_url, api_key, model_name):
        super(ChatModel, self).__init__()
        self.base_url = base_url
        self.api_key = api_key
        self.model_name = model_name


    def __create_message(self, user_input):
        messages = [
            {"role": "system", "content": "你是知识图谱专家"},
            {"role": "user", "content": user_input}
        ]
        return messages
    def generate(self, user_input):

        response = requests.post(
            url=self.base_url,
            json={
                "model": "deepseek-v3-241226",
                "messages": self.__create_message(user_input)
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
        )
        response_obj = response.json()
        return response_obj['choices'][0]['message']['content']


class EmbeddingModel(BaseEmbeddingModel):
    def __init__(self, ):
        super(EmbeddingModel, self).__init__()


class ImageModel(BaseImageModel):
    def __init__(self):
        super(ImageModel, self).__init__()


class AudioModel(BaseAudioModel):
    def __init__(self):
        super(AudioModel, self).__init__()
