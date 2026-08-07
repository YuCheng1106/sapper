from abc import ABC

class BaseCompiler(ABC):
    def __init__(self):
        pass


class BasePromptCompiler(BaseCompiler):
    def __init__(self):
        super(BasePromptCompiler, self).__init__()
        pass
