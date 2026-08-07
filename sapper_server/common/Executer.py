from abc import ABC, abstractmethod
from common.Tool import ConvertTool, StructuredDataExtract_API_Utility, UnstructuredDataExtract_API_Utility, ReadTool
import re
import os

import json
class RequestAnalyzer():
    def __init__(self,API_Call,API_HandleUtility):
        self.API_Call = API_Call
        self.API_HandleUtility = API_HandleUtility
    def Analyze(self,Request):
        base_path = os.path.dirname(__file__).replace('\\common', "").replace('/common', "")  # 获取当前文件的目录
        SplitJsonPrompt = ReadTool.Read_Txtfile(base_path + "/services/Prompts/RequestAnalyze/Spilt.txt")
        try:
            Decomposemessage = [
                # {"role": "system", "content": SplitJsonPrompt},
                {"role": "user", "content": SplitJsonPrompt + "\nuser query: " + Request.Text + "\n"},
            ]
            JsonDecomposedReuqest = self.API_HandleUtility.Run(Decomposemessage)
            DecomposedReuqest = json.loads(JsonDecomposedReuqest)
            API_Calls = ""
            AnalyzeJsonPrompt = ReadTool.Read_Txtfile(base_path + "/services/Prompts/RequestAnalyze/Decompose.txt")
            for item in self.API_Call:
                API_Calls = API_Calls + "\n    " + "@Term " + item["API_Name"] + ": " + item["Description"]
            AnalyzePrompt = AnalyzeJsonPrompt.replace("{External_API}", API_Calls)
            Analyzemessage = [
                {"role": "system", "content": AnalyzePrompt},
                {"role": "user", "content": DecomposedReuqest["Instruction"]},
                ]
            AnalyzeResult = self.API_HandleUtility.Run(Analyzemessage)
            AnalyzeJsonResult = json.loads(AnalyzeResult)
            return Request.Text, AnalyzeJsonResult["API_Call"].pop()

        except Exception as e:
            print(e)
            return Request.Text, "None"

class Pre_PromptGen():
    def __init__(self,DataExtractAPI_HandleUtility):
        self.DataExtractAPI_HandleUtility = DataExtractAPI_HandleUtility

    def Proprocessing_Partial_SplPrompts(self,Partial_SplPrompts,Request=None):
        Json_Exp = self.DataExtractAPI_HandleUtility.Extract_Data(Request)
        Partial_SplPrompts = Partial_SplPrompts.append(Json_Exp)
        return Partial_SplPrompts

class IGenPrompt():
    def PromptGen(self,**kwargs):
        Partial_SplPrompts = kwargs.get('Partial_SplPrompts', None)
        Request = kwargs.get('Request', "")
        SPL_Prompt_Name = kwargs.get('SPL_Prompt_Name', None)
        if Partial_SplPrompts == None:
            prompt = Request
            return prompt
        else:
            Spl_prompt = SPL_Prompt_Name+" {\n"+ConvertTool.JSON2SPL(Partial_SplPrompts)+"\n}"
            return Spl_prompt

class PromptHander(ABC):
    def __init__(self):
       pass
    def PromptHandle(self,handleTool, **kwargs):
        try:
            API = kwargs.get('API', None)
            Prompt = kwargs.get("Prompt", None)
            Request = kwargs.get("Request", None)
            Stream = kwargs.get("Stream", None)
            if "ark.cn-beijing.volces.com" in API.Server_Url:
                Message = [{"role": 'system', "content": Prompt},
                           {"role": 'user', "content": Request.Text}]
            else:
                Message = Prompt + "\n" + Request.Text
            if API is not None:
                if API.Header_Info["Content-Type"] == "application/json":
                    if Stream and API.Return_Info['ReturnValue-Type'] == "Text" and "ark.cn-beijing.volces.com" in API.Server_Url:
                        API.API_Parameter['stream'] = True
                        print(API.API_Parameter['stream'], "stream")
                        res = handleTool.run_stream(Message)
                    else:
                        print(API.API_Parameter['stream'], "non-stream")
                        res = handleTool.Run(Message)
                elif API.Header_Info["Content-Type"] == "application/octet-stream":
                    res = handleTool.Run(Request.File_Path)
                else:
                    raise "Unsupported API " + API.API_Name

                return res  # Call the corresponding handler method
            else:
                # Handle other cases or raise an error for unsupported func values
                raise "Unsupported API"
        except Exception as e:
            # 在这里处理异常
            raise Exception(e)

class Post_PromptHandle():
    def __init__(self):
        pass

class AgentExecuter(ABC):
    # Agent根据用户的需求生成相应的响应需要2步 1) 根据表单Form生成Prompt 2)根据Prompt响应Response
    def __init__(self,Pre_GenPrompt,IGenPrompt,PromptHander,Post_HandlePrompt):
        self.Pre_GenPrompt = Pre_GenPrompt
        self.IGenPrompt = IGenPrompt
        self.PromptHander = PromptHander
        self.Post_HandlePrompt = Post_HandlePrompt
    @abstractmethod
    def GetResFromAgent(self,Agent,Request):
        pass

# DecomposeJsonPrompt = ReadTool.Read_Jsonfile("D:\workplace\Agent_Production_Center\Prompt\Memory\Longmemory.json")
# DecomposeJsonPrompt = ConvertTool.JSON2SPL(DecomposeJsonPrompt)
# print(DecomposeJsonPrompt)
