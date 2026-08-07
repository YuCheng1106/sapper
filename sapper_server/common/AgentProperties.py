from abc import ABC, abstractmethod

class Agent(ABC):
    def __init__(self,Name,Description,Model,Prompt,APIBase,AIChain,LongTerm_Memory, ShortTerm_Memory):
        self.Name = Name
        self.Description = Description
        self.Model = Model
        self.Prompt = Prompt
        self.APIBase = APIBase
        self.AIChain = AIChain
        self.LongTerm_Memory = LongTerm_Memory
        self.ShortTerm_Memory = ShortTerm_Memory

class Chain():
    def __init__(self,Queue,Stack):
        self.Queue = Queue
        self.Stack = Stack

class LongTerm_Memory():
    def __init__(self):
        self.Memory_Depth = 10
        self.Preference = ""
        self.View = {}

class ShortTerm_Memory():
    def __init__(self):
        self.Memory_Depth = 1
        self.ChatHistory = []
        self.Variables = {}

class Variable():
    def __init__(self, Name, Usgae,DataType, TrueValue, ShowValue, Refs):
        self.Name = Name
        self.Usage = Usgae
        self.DataType = DataType
        self.TrueValue = TrueValue
        self.ShowValue = ShowValue
        self.Refs = Refs

class Request():
    def __init__(self,Text,File_Path=None):
        self.Text = Text
        self.File_Path = File_Path


class Session():
    def __init__(self,Request,Response):
        self.Request = Request
        self.Response = Response

class Memory(ABC):
    def __init__(self):
        self.ChatHistory = []
        self.Memory_Depth = 1

class LongMemory(Memory):
    def __init__(self):
        super(LongMemory, self).__init__()
        self.Preference = ""

class ShortMemory(Memory):
    def __init__(self):
        super(ShortMemory, self).__init__()

class API(ABC):
    """
    Abstract base class for various APIs.
    """
    def __init__(self, API_Name: str, Description: str):
        self.API_Name = API_Name
        self.Description = Description


class DataExtract_API(API):
    """
    Base class for data extraction APIs.
    """
    def __init__(self, API_Name: str, Description: str):
        super().__init__(API_Name, Description)

class UnstructuredDataExtract_API(DataExtract_API):
    """
    Class for APIs that extract data from unstructured sources.
    """
    def __init__(self, API_Name: str, Description: str):
        super().__init__(API_Name, Description)

class StructuredDataExtract_API(DataExtract_API):
    """
    Class for APIs that extract data from structured sources.
    """
    def __init__(self, API_Name: str, API_Type: str, Description: str, Experience: str, Use_Field: list, Search_Field: list, Template: str):
        super().__init__(API_Name, Description)
        self.API_Type = API_Type
        self.Experience = Experience
        self.Use_Field = Use_Field
        self.Search_Field = Search_Field
        self.Template = Template

class Model_Call_API(API):
    def __init__(self,API_Name, Description, Server_Url, Header_Info, Return_Info, API_Parameter):
        super(Model_Call_API, self).__init__(API_Name,Description)
        self.Server_Url = Server_Url
        self.Header_Info = Header_Info
        self.Return_Info = Return_Info
        self.API_Parameter = API_Parameter

class ExternalAPI(ABC):
    def __init__(self,API_Name, Description, Server_Url, Header_Info, Return_Info, API_Parameter):
        self.API_Name = API_Name
        self.Description = Description
        self.Server_Url = Server_Url
        self.Header_Info = Header_Info
        self.Return_Info = Return_Info
        self.API_Parameter = API_Parameter
