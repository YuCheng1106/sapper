import json
from ..LLMs.chatgpt import Chatgpt_json


class GenerateConversationName:
    @classmethod
    async def generate(cls, openai_key: str, query: str):
        chatgpt_json = await Chatgpt_json.create(openai_key)
        prompt = [{"role": "system", "content": "请根据用户的消息生成一个10个字以内的标题"},
                  {"role": "user", "content": query + "\noutput mast be a json\noutput json: {title: ''}"}]
        response = await chatgpt_json.process_message(prompt)
        response = response.choices[0].message.content
        try:
            response = json.loads(response)
            response = response.get("title", "")
        except:
            pass
        yield json.dumps({
            "content":response
        })
