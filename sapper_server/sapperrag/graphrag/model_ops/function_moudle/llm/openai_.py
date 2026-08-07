from ...base_model import BaseEmbeddingModel, BaseImageModel, BaseChatModel, BaseAudioModel
from openai import OpenAI

class EmbeddingModel(BaseEmbeddingModel):
    def __init__(self, model_name, api_key, base_url):
        super(EmbeddingModel, self).__init__()
        self.model_name = model_name
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, user_input):
        try:
            response = self.client.embeddings.create(
                input=user_input,
                model=self.model_name,
            )
            embedding_vector = response.data[0].embedding
            return embedding_vector
        except Exception as e:
            print(f"Error while generating embedding: {e}")
            return []

class ChatModel(BaseChatModel):
    def __init__(self, base_url, api_key, model_name, model_output_format):
        super(ChatModel, self).__init__( )
        self.base_url = base_url
        self.api_key = api_key
        self.model_name = model_name
        self.model_output_format = model_output_format
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, user_input):
        completion = self.client.beta.chat.completions.parse(
            model=self.model_name,
            messages=[
                {"role": "system","content": "You are a helpful assistant"},
                {"role": "user", "content": user_input}
            ],
            response_format=self.model_output_format,
        )
        return completion.choices[0].message.parsed
class ImageModel(BaseImageModel):
    def __init__(self):
        super(ImageModel, self).__init__()
        pass

    def generate(self, user_input):
        pass

class AudioModel(BaseAudioModel):
    def __init__(self):
        super(AudioModel, self).__init__()
        pass

    def generate(self, user_input):
        pass