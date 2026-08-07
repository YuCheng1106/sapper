import logging
from abc import ABC, abstractmethod
import copy
import shutil
from functools import reduce
import tempfile
import json
import httpx
import pandas as pd
from httpx import Timeout, AsyncClient
from iteration_utilities import flatten
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import urllib.request
import requests

from .AgentFunctionModuleBase.GraphRagModule import GraphDataRetriever
from .AgentFunctionModuleBase.RAGModule import DBGetter, DataRetriever
from .AgentProperties import ExternalAPI
from common.fileupload import upload_file
import base64
import uuid

timeout = Timeout(60.0, read=360.0)  # 连接超时为5秒，读取超时为30秒


class ConvertTool:
    @staticmethod
    def JSON2SPL(jsonData):
        result = []
        for item in jsonData:
            section_type = "@" + item["sectionType"]
            sub_sections = []

            for sub_item in item["section"]:
                sub_section_type = "@" + sub_item["subSectionType"]
                content = sub_item["content"]

                if sub_section_type == "@Name":
                    # Handling "Name" differently by appending the content directly to the section type
                    section_type += f" {content}"
                else:
                    if isinstance(content, list):
                        temp_content = []
                        for item in content:
                            temp_content.append(sub_section_type + " " + item)
                        content = '\n    '.join(temp_content)
                    elif isinstance(content, dict):
                        # Formatting the dictionary content with line breaks, avoiding backslashes in f-strings
                        formatted_content = []
                        print(content)
                        for key, value in content.items():
                            # Indenting each line for 'input' and 'output'
                            if key in ['input', 'output']:
                                indented_value = '\n'.join(['            ' + line for line in value.split('\n')])
                                indented_value = f"        @{key} {{\n{indented_value}\n        }}"
                            elif key in ['knowledge']:
                                continue
                            else:
                                indented_value = value
                            formatted_content.append(indented_value)
                        content = '\n'.join(formatted_content)

                    if '@input' in content:
                        sub_sections.append(f"    {sub_section_type} {{\n{content}\n    }}")
                    elif sub_section_type == '@Format':
                        sub_sections.append(f"    {sub_section_type} {{\n{content}\n    }}")
                    else:
                        sub_sections.append(f"    {content}\n    ")
            result.append(f"{section_type} {{\n" + "\n".join(sub_sections) + "}")
        Spl_prompt = "\n".join(result)
        return Spl_prompt

    @staticmethod
    def SPL2JSON():
        pass


class ReadTool:
    @staticmethod
    def Read_Jsonfile(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    @staticmethod
    def Read_Txtfile(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()


class API_HandleUility(ABC):
    def __init__(self, API):
        self.API = API

    @abstractmethod
    def Run(self, request):
        pass


class ModelCall_API_HandleUtility(API_HandleUility):
    def __init__(self, ModelCall_API):
        super(ModelCall_API_HandleUtility, self).__init__(ModelCall_API)
        self.API = ModelCall_API

    def run_stream(self, request):
        try:
            API_URL = self.API.Server_Url
            print("stream")
            # 找到用户输入参数的索引
            User_Input_Index = next((key for key, value in self.API.API_Parameter.items() if value == "{User_Request}"),
                                    None)
            if User_Input_Index is not None:
                self.API.API_Parameter[User_Input_Index] = request
            data = json.dumps(self.API.API_Parameter)
            # 发送请求
            response = requests.post(API_URL, headers=self.API.Header_Info, data=data, stream=True)
            # 恢复原始参数值以供下次使用
            if User_Input_Index is not None:
                self.API.API_Parameter[User_Input_Index] = "{User_Request}"
            try:
                for part in response.iter_lines():
                    if part and not part.isspace():
                        # 将bytes解码为str
                        part_str = part.decode('utf-8')
                        # 如果part以'data: '开头，去除这个前缀
                        if part_str.startswith('data: '):
                            part_str = part_str[6:]
                        try:
                            decoded_part = json.loads(part_str)  # 假设每个part是有效的JSON字符串
                            # 假设响应结构包含choices和finish_reason
                            if 'choices' in decoded_part and decoded_part['choices'][0]['finish_reason'] == "stop":
                                break
                            yield decoded_part['choices'][0]['delta']['content']  # 修改为实际的键名
                        except json.JSONDecodeError as e:
                            raise "API Error"
            except json.JSONDecodeError as e:
                raise "API Error"
        except json.JSONDecodeError as e:
            # raise f"Error decoding JSON: {e}"
            raise "API Error"

    def Run(self, request):

        try:
            API_URL = self.API.Server_Url

            # =============输入处理================
            if self.API.Header_Info["Content-Type"] == "application/json":
                User_Input_Index = next(
                    (key for key, value in self.API.API_Parameter.items() if value == "{User_Request}"), None)
                self.API.API_Parameter[User_Input_Index] = request
                data = json.dumps(self.API.API_Parameter)
                self.API.API_Parameter[User_Input_Index] = "{User_Request}"

            elif self.API.Header_Info["Content-Type"] == "application/octet-stream":

                file_response = urllib.request.urlopen(request)
                data = file_response.read()

            # ========发送请求===================
            response = requests.post(API_URL, headers=self.API.Header_Info, data=data)

            Json_Result = response.json()

            Result = reduce(lambda d, k: d[k], self.API.Return_Info["Parse_Path"], Json_Result)
            # ======处理======
            if self.API.Return_Info["return_value_type"] == "Text":
                return Result
            elif self.API.Return_Info["return_value_type"] == "Url":
                # print("hello")
                # with requests.get(Result, stream=True) as r:
                #     r.raise_for_status()
                #     with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
                #         with open(temp_file.name, 'wb') as f:
                #             shutil.copyfileobj(r.raw, f)
                # print(temp_file.name)
                return Result

            elif self.API.Return_Info["return_value_type"] == "Image_Binary_Data":
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(Result)
                temp_filename = upload_file(temp_filename, "sapper.png")
                return temp_filename

            elif self.API.Return_Info["return_value_type"] == "Speech_Binary_Data":
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(Result)
                temp_filename = upload_file(temp_filename, "sapper.wav")
                return temp_filename

            elif self.API.Return_Info["return_value_type"] == "Image_B64_Data":
                data = base64.b64decode(Result)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(data)
                temp_filename = upload_file(temp_filename, "sapper.png")
                return temp_filename

            elif self.API.Return_Info["return_value_type"] == "Speech_B64_Data":
                data = base64.b64decode(Result)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(data)
                temp_filename = upload_file(temp_filename, "sapper.wav")
                return temp_filename
        except json.JSONDecodeError as e:
            # raise f"Error decoding JSON: {e}"
            raise "API Error"


class DataExtractUtility(API_HandleUility):
    def __init__(self, DataExtract_API):
        super(DataExtractUtility, self).__init__(DataExtract_API)
        self.DataExtract_API = DataExtract_API

    @abstractmethod
    def Extract_Data(self, request=None):
        pass


class UnstructuredDataExtract_API_Utility(DataExtractUtility):
    def __init__(self, UnstructuredDataExtract_API):
        super(UnstructuredDataExtract_API_Utility, self).__init__(UnstructuredDataExtract_API)

    def Extract_Data(self, request=None):
        pass



class StructuredDataExtract_API_Utility(DataExtractUtility):
    def __init__(self, StructuredDataExtract_API):
        super(StructuredDataExtract_API_Utility, self).__init__(StructuredDataExtract_API)

    def Extract_Data(self, Request=None):
        df = pd.read_csv(self.DataExtract_API.Experience)
        similarity_scores = []
        for index, row in df.iterrows():
            row_similarity = -1
            Search = ""
            for search_field in self.DataExtract_API.Search_Field:
                Search += str(row[search_field])
            tfidf_vectorizer = TfidfVectorizer()
            tfidf_matrix = tfidf_vectorizer.fit_transform([Request, str(Search)])
            similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            similarity = similarity_matrix[0][0]
            if similarity > row_similarity:
                row_similarity = similarity
            similarity_scores.append((row_similarity, row))
        similarity_scores.sort(key=lambda x: x[0], reverse=True)
        top_three_similar_rows = similarity_scores[:3]
        Exp = []
        for i, (score, row) in enumerate(top_three_similar_rows):
            temp = self.DataExtract_API.Template
            for field in self.DataExtract_API.Use_Field:
                temp = temp.replace(f"{{{field}}}", row[field])
            Exp.append(temp)

        ###展示
        # Exampletemplate = f'''"input": {Exp}, "output":{Exp}'''

        JsonExp = {
            "sectionId": 1,
            "sectionType": "Experience",
            "section": [
                {
                    "subSectionId": "S1",
                    "subSectionType": "Experience",
                    "content": Exp
                }
            ]
        }

        return JsonExp


class ExternalAPIHandleUtility():
    def __init__(self, API):
        self.API = API

    async def run_stream(self):

        try:
            API_URL = self.API.Server_Url
            headers = self.API.Header_Info
            data = None
            if headers["Content-Type"] == "application/json":
                print("API.API_Parameter： ", self.API.API_Parameter)
                data = self.API.API_Parameter.copy()

                logging.info(self.API.API_Parameter)
                data['stream'] = True
                data = json.dumps(data)

            elif headers["Content-Type"] == "application/octet-stream":
                # 使用httpx异步获取文件内容
                async with httpx.AsyncClient() as client:
                    file_response = await client.get(self.API.API_Parameter["FilePath"])
                    data = file_response.content

            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", API_URL, headers=headers, data=data) as response:
                    async for part in response.aiter_lines():
                        if part and not part.isspace():
                            part_str = part
                            if part_str.startswith('data: '):
                                part_str = part_str[6:]
                                if part_str == '[DONE]':
                                    break
                                try:
                                    decoded_part = json.loads(part_str)
                                    result = decoded_part
                                    result = reduce(lambda d, k: d[k], self.API.Return_Info["parse_path"], result)
                                    # print(result, self.API.Return_Info["parse_path"] )
                                    # for key in self.API.Return_Info.get("parse_path", []):
                                    #     print(result)
                                    #     result = result.get(key, "")
                                    #     if not result: break
                                    if result:
                                        yield result
                                except Exception as e:
                                    print(part)
                                    # raise Exception("API Error")
                                    # yield decoded_part['choices'][0]['delta']['content']  # 根据你的具体响应结构修改
                            else:
                                print(part)

        except Exception as e:
            # 异常处理应根据具体情况来定
            raise Exception("API Error") from e

    async def Run(self):
        API_URL = self.API.Server_Url
        data = None

        # =============输入处理================
        if self.API.Header_Info["Content-Type"] == "application/json":
            data = json.dumps(self.API.API_Parameter)


        elif self.API.Header_Info["Content-Type"] == "application/octet-stream":
            file_response = urllib.request.urlopen(self.API.API_Parameter["FilePath"])
            data = file_response.read()
        # ========发送请求===================
        headers = self.API.Header_Info
        async with AsyncClient(timeout=timeout) as client:
            response = await client.post(API_URL, headers=headers, content=data)
            Json_Result = response.json()
            print(Json_Result)
            Result = reduce(lambda d, k: d[k], self.API.Return_Info["parse_path"], Json_Result)
            # ======处理======
            if self.API.Return_Info["return_value_type"] == "Text":
                return Result
            elif self.API.Return_Info["return_value_type"] == "Url":
                return Result
            elif self.API.Return_Info["return_value_type"] == "Speech_Url":
                with requests.get(Result, stream=True) as r:
                    r.raise_for_status()
                    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                        with open(temp_file.name, 'wb') as f:
                            shutil.copyfileobj(r.raw, f)
                return temp_file.name
            elif self.API.Return_Info["return_value_type"] == "Image_Binary_Data":
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(Result)
                temp_filename = upload_file(temp_filename, "sapper.png")
                return temp_filename
            elif self.API.Return_Info["return_value_type"] == "Speech_Binary_Data":
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(Result)
                temp_filename = upload_file(temp_filename, "sapper.wav")
                return temp_filename
            elif self.API.Return_Info["return_value_type"] == "Image_B64_Data":
                data = base64.b64decode(Result)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(data)
                temp_filename = upload_file(temp_filename, "sapper.png")
                return temp_filename
            elif self.API.Return_Info["return_value_type"] == "Speech_B64_Data":
                data = base64.b64decode(Result)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                    temp_filename = temp_file.name
                    temp_file.write(data)
                temp_filename = upload_file(temp_filename, "sapper.wav")
                return temp_filename


class DataUsageUtility:
    def __init__(self, search_query, DefView, DBGetter, DataRetriever):
        self.search_query = search_query
        self.DefView = DefView
        self.DBGetter = DBGetter
        self.DataRetriever = DataRetriever

    async def GetData(self):
        Result = await self.DataRetriever.Execute(self.search_query, self.DefView)
        return Result


class GraphDataUsageUtility:
    def __init__(self, search_query, DefView, DataRetriever):
        self.search_query = search_query
        self.DefView = DefView
        self.DataRetriever = DataRetriever

    async def GetGraphData(self):
        Result = self.DataRetriever.Execute(self.search_query, self.DefView)
        return Result


class RefProcessUtility:
    def __init__(self, VariablesSpace, ViewsSpace):
        self.VariablesSpace = VariablesSpace
        self.ViewsSpace = ViewsSpace

        self.RefSet = {
            "RefData": DataUsageUtility,
            "RefGraphData": GraphDataUsageUtility,
            "RefGuardrail": GuardralilUtility,
            "RefCheck": CheckUtility,
            "RefAPI": ExternalAPIHandleUtility,
            "NativeAPI": ExternalAPIHandleUtility
        }

    def SetRefUtility(self, DictRef):
        print(f"ref_infos:{DictRef}")
        if DictRef["RefPackage"] in self.RefSet:
            if DictRef["RefPackage"] == "RefData":
                if self.ViewsSpace[DictRef["RefProperties"]["data_source"]].get("text_blocks", None) is not None:
                    print("excute data")
                    RefUtility = self.RefSet[DictRef["RefPackage"]](
                        search_query=DictRef["RefProperties"]["search_query"],
                        DefView=self.ViewsSpace[DictRef["RefProperties"]["data_source"]]["text_blocks"],
                        DBGetter=DBGetter({}),
                        DataRetriever=DataRetriever())
                else:
                    RefUtility = self.RefSet["RefGraphData"](
                        search_query=DictRef["RefProperties"]["search_query"],
                        DefView=self.ViewsSpace[DictRef["RefProperties"]["data_source"]]["graph_data"],
                        DataRetriever=GraphDataRetriever())
                return RefUtility

            elif DictRef["RefPackage"] == "RefGraphData":
                RefUtility = self.RefSet[DictRef["RefPackage"]](
                    search_query=DictRef["RefProperties"]["search_query"],
                    DefView=self.ViewsSpace[DictRef["RefProperties"]["data_source"]["graph_data"]],
                    GraphDataRetriever=GraphDataRetriever())
                return RefUtility

            elif DictRef["RefPackage"] == "RefAPI" or DictRef["RefPackage"] == "NativeAPI":
                API = ExternalAPI(API_Name=DictRef["RefProperties"]["Name"],
                                  Description=DictRef["RefProperties"]["Description"],
                                  Server_Url=DictRef["RefProperties"]["Server_Url"],
                                  Header_Info=DictRef["RefProperties"]["Header_Info"],
                                  Return_Info=DictRef["RefProperties"]["Return_Info"],
                                  API_Parameter=DictRef["RefProperties"]["API_Parameter"])
                RefUtility = self.RefSet[DictRef["RefPackage"]](API=API)
                return RefUtility
            elif DictRef["RefPackage"] == "RefGuardrail":
                RefUtility = self.RefSet[DictRef["RefType"]]()
                RefUtility.TargetVariable = DictRef["RefObject"]
                RefUtility.WillExcuteGuardrailType = DictRef["RefInfo"]["GuardrailTypeName"]
                return RefUtility
            elif DictRef["RefPackage"] == "RefCheck":
                RefUtility = self.RefSet[DictRef["RefType"]]()
                RefUtility.WillExcuteCheck = DictRef["RefInfo"]["CheckTypeName"]
                return RefUtility
        else:
            pass

    async def ExcuteRef(self, RefUtility, stream=False):
        if isinstance(RefUtility, DataUsageUtility):
            Res = await RefUtility.GetData()
            return Res
        elif isinstance(RefUtility, GraphDataUsageUtility):
            print("GraphDataUsageUtility")
            Res = await RefUtility.GetGraphData()
            print(Res)
            return Res
        elif isinstance(RefUtility, GuardralilUtility):
            Guardrail = RefUtility.GuardrailSet.get(RefUtility.WillExcuteGuardrailType)
            if Guardrail:
                Guardrail()
            else:
                pass

        elif isinstance(RefUtility, CheckUtility):
            Check = RefUtility.CheckSet.get(RefUtility.WillExcuteCheckType)
            if Check:
                Check()
            else:
                pass
        elif isinstance(RefUtility, ExternalAPIHandleUtility):
            if stream:
                Res = RefUtility.run_stream()
            else:
                Res = await RefUtility.Run()
            return Res
        else:
            print("No Execute")


class DecomposeUtility():
    def __init__(self, APIBase, ExternalAPIHandleUtility):
        self.APIBase = APIBase
        self.ExternalAPIHandleUtility = ExternalAPIHandleUtility
        self.base_path = os.path.dirname(__file__).replace('\\common', "").replace('/common', "")
        self.Decompose_Prompt = ReadTool.Read_Txtfile(
            self.base_path + "/services/Prompts/Compile/Decompose/Decompose.txt")
        # self.Decompose_Prompt = ReadTool.Read_Txtfile("../Prompt/Compile/Decompose/Decompose.txt")

    async def DecomposeBaseAPI(self, Partial_SplPrompts):
        SplPrompt_Instructions = [Partial_SplPrompts[Index] for Index, section in enumerate(Partial_SplPrompts) if
                                  section.get("sectionType") == "Instruction"]
        SplPrompt_NonInstruction = [Partial_SplPrompt for Partial_SplPrompt in Partial_SplPrompts if
                                    Partial_SplPrompt not in SplPrompt_Instructions]
        # ================================================================================================================
        if self.APIBase != None:
            API_List = []
            API_Calls = ""
            for APIName, API in self.APIBase.items():
                API_information = API.API_Name + ":" + API.Description
                API_List.append(API_information)
            for item in API_List:
                API_Calls = API_Calls + "\n    " + item
            Decompose_Prompt = self.Decompose_Prompt.replace("{External_API}", API_Calls)
            # ===================================================================================================================
            for Instruction_index, ITEM in enumerate(SplPrompt_Instructions):

                TempInstruction = []
                NeedCombineCommands = []

                # Intruction中的所有元素
                try:
                    Commands = \
                    [section for section in ITEM["section"] if section.get("subSectionType") == "Commands"][0][
                        "content"]
                except Exception as e:
                    yield json.dumps({'type': 'logInfo', 'content': "Info: Commands is empty\n"})
                    continue

                try:
                    Output = \
                    [section for section in ITEM["section"] if section.get("subSectionType") == "OutputVariable"][0][
                        "content"]
                except Exception as e:
                    Output = "${Instruction" + str(Instruction_index + 1) + "_Output}$"
                    ITEM["section"].append(
                        {
                            "subSectionId": str(Instruction_index) + "_output",
                            "subSectionType": "OutputVariable",
                            "content": Output
                        }
                    )
                    yield json.dumps({'type': 'logInfo',
                                      'content': f"Info: Missing output variables for Instruction {Instruction_index + 1}\n"})

                try:
                    Input = \
                    [section for section in ITEM["section"] if section.get("subSectionType") == "InputVariable"][0][
                        "content"]
                except Exception as e:
                    Input = "${UserRequest}$"
                    ITEM["section"].append(
                        {
                            "subSectionId": str(Instruction_index) + "_input",
                            "subSectionType": "InputVariable",
                            "content": Input
                        }
                    )
                    yield json.dumps({'type': 'logInfo',
                                      'content': f"Info: Missing input variables for Instruction {Instruction_index + 1}\n"})

                # 设置一个临时变量来链接分解后的Instruction
                tempVariable = "${TemporaryVariable}$"
                [section for section in ITEM["section"] if section.get("subSectionType") == "InputVariable"][0][
                    "content"] = tempVariable
                [section for section in ITEM["section"] if section.get("subSectionType") == "OutputVariable"][0][
                    "content"] = tempVariable
                Instruction_no_commands = [section for section in ITEM["section"] if
                                           section.get("subSectionType") != "Commands"]
                # 设置一个Flag判断什么时候要将
                flag_CommandsCombinePoint = 0

                for command_index, command in enumerate(Commands):
                    if "~refAPI" in command:
                        if flag_CommandsCombinePoint == 1:
                            CommandSection = {
                                "subSectionId": f'''{Instruction_index}_{ITEM['sectionId']}_{command_index}_{uuid.uuid4()}_command''',
                                "subSectionType": "Commands",
                                "content": NeedCombineCommands
                            }

                            NewInstruction = {
                                "sectionId": f"{Instruction_index}_{ITEM['sectionId']}_{command_index}_{uuid.uuid4()}_nonapi",
                                "sectionType": "Instruction",
                                "section": list(flatten([[CommandSection], [section for section in
                                                                            copy.deepcopy(Instruction_no_commands)]]))
                            }
                            NeedCombineCommands = []
                            flag_CommandsCombinePoint = 0
                            TempInstruction.append(NewInstruction)

                        else:
                            pass
                        CommandSection = {
                            "subSectionId": f'''{Instruction_index}_{ITEM['sectionId']}_{command_index}_{uuid.uuid4()}_command''',
                            "subSectionType": "Commands",
                            "content": [command]
                        }

                        NewInstruction = {
                            "sectionId": f"{Instruction_index}_{ITEM['sectionId']}_{command_index}_{uuid.uuid4()}_api",
                            "sectionType": "Instruction",
                            "section": list(flatten(
                                [[CommandSection], [section for section in copy.deepcopy(Instruction_no_commands)]]))
                        }
                        TempInstruction.append(NewInstruction)


                    else:
                        message = [
                            {"role": "system", "content": Decompose_Prompt},
                            {"role": "user", "content": command},
                        ]

                        self.ExternalAPIHandleUtility.API.API_Parameter["messages"] = message
                        Decomposed_command = await self.ExternalAPIHandleUtility.Run()
                        try:
                            Json_Format_Decompose_Command = json.loads(Decomposed_command)

                        except Exception as e:
                            Json_Format_Decompose_Command = {
                                'Decompose_Command': [{'Command': command, 'API_Call': 'None'}]}
                        for Json_Decompose_Command_Index, Json_Decompose_Command in enumerate(
                                Json_Format_Decompose_Command["Decompose_Command"]):

                            if Json_Decompose_Command["API_Call"] != "None":
                                ## def /refAPI
                                defAPI = ""
                                if flag_CommandsCombinePoint == 1:
                                    CommandSection = {
                                        "subSectionId": f'''{Instruction_index}_{ITEM['sectionId']}_{command_index}_{Json_Decompose_Command_Index}_{uuid.uuid4()}_command''',
                                        "subSectionType": "Commands",
                                        "content": NeedCombineCommands
                                    }

                                    NewInstruction = {
                                        "sectionId": f"{Instruction_index}_{ITEM['sectionId']}_{command_index}_{Json_Decompose_Command_Index}_{uuid.uuid4()}_api",
                                        "sectionType": "Instruction",
                                        "section": list(flatten(
                                            [[CommandSection], [section for section in Instruction_no_commands]]))
                                    }
                                    NeedCombineCommands = []
                                    flag_CommandsCombinePoint = 0
                                    TempInstruction.append(NewInstruction)

                                else:
                                    pass
                                for APIName, API in self.APIBase.items():
                                    if API.API_Name == Json_Decompose_Command["API_Call"]:
                                        defAPI = fr"~refAPI{{{Json_Decompose_Command['API_Call']}}}{json.dumps(API.API_Parameter)}/refAPI"
                                        command = Json_Decompose_Command["Command"] + defAPI
                                        CommandSection = {
                                            "subSectionId": f'''{Instruction_index}_{ITEM['sectionId']}_{command_index}_{Json_Decompose_Command_Index}_{uuid.uuid4()}_command''',
                                            "subSectionType": "Commands",
                                            "content": [command]
                                        }

                                        NewInstruction = {
                                            "sectionId": f"{Instruction_index}_{ITEM['sectionId']}_{command_index}_{Json_Decompose_Command_Index}_{uuid.uuid4()}_nonapi",
                                            "sectionType": "Instruction",
                                            "section": list(flatten([[CommandSection], [section for section in
                                                                                        copy.deepcopy(
                                                                                            Instruction_no_commands)]]))
                                        }

                                        TempInstruction.append(NewInstruction)

                                        break
                                    else:
                                        pass
                            else:
                                NeedCombineCommands.append(Json_Decompose_Command["Command"])
                                flag_CommandsCombinePoint = 1
                                if command_index == len(Commands) - 1:
                                    CommandSection = {
                                        "subSectionId": f'''{Instruction_index}_{ITEM['sectionId']}_{command_index}_{uuid.uuid4()}_command''',
                                        "subSectionType": "Commands",
                                        "content": NeedCombineCommands
                                    }

                                    NewInstruction = {
                                        "sectionId": f"{Instruction_index}_{ITEM['sectionId']}_{command_index}_{uuid.uuid4()}_nonapi",
                                        "sectionType": "Instruction",
                                        "section": list(flatten([[CommandSection], [section for section in
                                                                                    copy.deepcopy(
                                                                                        Instruction_no_commands)]]))
                                    }
                                    NeedCombineCommands = []
                                    flag_CommandsCombinePoint = 0
                                    TempInstruction.append(NewInstruction)
                # 将拆建后的Instructions赋予真实的输入变量名和输出变量名
                [section for section in TempInstruction[0]["section"] if
                 section.get("subSectionType") == "InputVariable"][0]["content"] = Input
                [section for section in TempInstruction[-1]["section"] if
                 section.get("subSectionType") == "OutputVariable"][0]["content"] = Output
                SplPrompt_NonInstruction.extend(TempInstruction)

        yield json.dumps({'type': 'result', 'content': SplPrompt_NonInstruction})


class GuardralilUtility():
    def __init__(self):
        self.GuardrailSet = {
            "AnonymityGuardrail": self.AnonymiryGuardrail
        }
        self.WillExcuteGuardrailType = ""
        self.TargetVariable = ""

    def AnonymiryGuardrail(self):
        self.TargetVariable.ShowValue = "*******"


class CheckUtility():
    def __init__(self):
        self.CheckSet = {
            "CheckIfValueNull": self.CheckIfValueNull
        }
        self.WillExcuteCheckType = ""
        self.TargeVariable = ""

    def CheckIfValueNull(self):
        if self.TargeVariable.TrueValue != None:
            return True
        return False
