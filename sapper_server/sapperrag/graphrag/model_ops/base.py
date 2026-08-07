from abc import ABC, abstractmethod

# from langchain_community.llms.openai import OpenAIChat

class BaseModel(ABC):
    def __init__(self):
        pass

    def generate(self, user_input):
        pass



