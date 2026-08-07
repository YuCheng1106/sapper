from abc import ABC,abstractmethod
class AgentCompiler(ABC):
    def __init__(self, DecomposeUtility):
        self.DecomposeUtility = DecomposeUtility
    @abstractmethod
    def Compile(self, Agent):
        pass

class SPL2AIChainCompiler(AgentCompiler):
    def __init__(self,DecomposeUtility):
        super(SPL2AIChainCompiler, self).__init__(DecomposeUtility)

    def Compile(self, Agent):
        AIChainSplPrompt = self.DecomposeUtility.BaseAPI_decompose(Agent.Prompt, Agent.API_Call)

        return AIChainSplPrompt
