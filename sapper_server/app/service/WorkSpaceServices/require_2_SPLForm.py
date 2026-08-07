import json
from ..LLMs.chatgpt import Chatgpt_json
import os


class Require2SPLForm:
    def __init__(self,chatgpt_json, user_description, persona_domain, prompt1, prompt2, prompt3) -> None:
        self.chatgpt_json = chatgpt_json
        self.user_description = user_description
        self.persona_domain = persona_domain
        self.prompt1 = prompt1
        self.prompt2 = prompt2
        self.prompt3 = prompt3

    @classmethod
    async def create(cls, openai_key, user_description):
        persona_domain = ""
        if persona_domain == "":
            mode = 'direct'
        else:
            mode = 'domain'
        chatgpt_json = await Chatgpt_json.create(openai_key)
        prompt1 = cls.get_prompt('conv_per_aud_des', mode)
        prompt2 = cls.get_prompt('context_control', mode)
        prompt3 = cls.get_prompt('instruction_content', mode)
        return cls(chatgpt_json, user_description, persona_domain, prompt1, prompt2, prompt3)

    @staticmethod
    def get_prompt(name: str, mode: str):
        base_path = os.path.dirname(__file__)  # 获取当前文件的目录
        if mode == 'direct':
            path = os.path.join(base_path, '..', 'Prompts', 'require2form')
        else:
            path = os.path.join(base_path, '..', 'Prompts', 'domain_require2form')
        try:
            with open(path + "/" + name, 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            return "File not found."
        except Exception as e:
            return f"An error occurred: {e}"

    async def conv_per_aud_des(self, system_prompt, user_description, persona_domain):
        prompt = [{"role": "system", "content": system_prompt}]
        prompt.append({"role": "user", "content": "[User task description]: {}\n@rule Output must be in Chinese.\n@rule Output must be json format.".format(user_description)})

        response = await self.chatgpt_json.process_message(prompt)
        result = json.loads(response.choices[0].message.content.replace("json", "").replace("```", ""))
        return result['result']["Character"], result['result']["Audience"], result['result']["Instructions"]

    async def context_control(self, system_prompt, user_description, persona_domain, persona, audience, instructions):
        prompt = [{"role": "system", "content": system_prompt}]
        prompt.append({"role": "user",
                       "content": "[User task description]: {}\n[Character]: {}\n[Audience]: {}\n[Character Instruction]: {}\n@rule Output must be in Chinese.\n@rule Output must be json format.".format(
                           user_description, persona, audience, instructions)})
        response = await self.chatgpt_json.process_message(prompt)
        result = json.loads(response.choices[0].message.content.replace("json", "").replace("```", ""))
        return result['result']['Restraints']

    async def instruction_content(self, system_prompt, user_description, persona_domain, persona, audience, instructions):
        prompt = [{"role": "system", "content": system_prompt}]
        prompt.append({"role": "user",
                       "content": "[User task description]: {}\n[Character]: {}\n[Audience]: {}\n[Character Instruction]: {}\n@rule Output must be in Chinese.\n@rule Output must be json format.".format(
                           user_description, persona, audience, instructions)})
        response = await self.chatgpt_json.process_message(prompt)
        result = json.loads(response.choices[0].message.content.replace("json", "").replace("```", ""))
        return result['result']["Commands"], result['result']["Restraints"]

    async def require_2_spl_form(self):
        persona, audience, instructions = await self.conv_per_aud_des(self.prompt1, self.user_description, self.persona_domain)
        agent_data = []
        personaData = {
            "sectionId": '1',
            "sectionType": "Persona",
            "section": [
                {
                    "subSectionId": "S1",
                    "subSectionType": "Description",
                    "content": persona
                }
            ]
        }
        agent_data.append(personaData)
        yield personaData
        audienceData = {
            "sectionId": '2',
            "sectionType": "Audience",
            "section": [
                {
                    "subSectionId": "S1",
                    "subSectionType": "Description",
                    "content": audience
                }
            ]
        }

        agent_data.append(audienceData)
        yield audienceData
        context_rule = await self.context_control(self.prompt2, self.user_description, self.persona_domain, persona, audience, instructions)
        contextRuleData = {
            "sectionId": '3',
            "sectionType": "ContextControl",
            "section": [
                {
                    "subSectionId": "S1",
                    "subSectionType": "Rules",
                    "content": context_rule
                }
            ]
        }

        agent_data.append(contextRuleData)
        yield contextRuleData
        for i, instruction_name in enumerate(instructions.keys()):
            instruction = instructions[instruction_name]
            instruction_command, instruction_rule = await self.instruction_content(self.prompt3, self.user_description,
                                                                                   self.persona_domain,
                                                                                   persona, audience, instruction)

            instructionData = {
                "sectionId": str(i + 4),
                "sectionType": 'Instruction',
                "section": []
            }

            if i == 0:
                instructionData['section'].append({
                    "subSectionId": "S8",
                    "subSectionType": "InputVariable",
                    "content": "~refParameter{UserRequest}/refParameter"
                })
            else:
                instructionData['section'].append({
                    "subSectionId": "S8",
                    "subSectionType": "InputVariable",
                    "content": "~refParameter{Output1}/refParameter"
                })

            try:
                instructionData['section'].append({
                    "subSectionId": "S5",
                    "subSectionType": "Name",
                    "content": instruction_name
                })
            except Exception as e:
                print(f"Error while adding section: {e}")

            try:
                instructionData['section'].append({
                    "subSectionId": "S1",
                    "subSectionType": "Commands",
                    "content": instruction_command
                })
            except Exception as e:
                print(f"Error while adding section: {e}")

            try:
                instructionData['section'].append({
                    "subSectionId": "S4",
                    "subSectionType": "Rules",
                    "content": instruction_rule
                })
            except Exception as e:
                print(f"Error while adding section: {e}")

            if i == 0:
                instructionData['section'].append({
                    "subSectionId": "S9",
                    "subSectionType": "OutputVariable",
                    "content": "~refParameter{Output1}/refParameter"
                })
            else:
                instructionData['section'].append({
                    "subSectionId": "S9",
                    "subSectionType": "OutputVariable",
                    "content": "~refParameter{Output2}/refParameter"
                })

            agent_data.append(instructionData)
            yield instructionData
