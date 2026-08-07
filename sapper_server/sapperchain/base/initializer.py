from abc import ABC

class BaseChainInitializer(ABC):
    def __init__(self):
        pass
    def init_chain(self, source_chain):
        pass


class BaseUnitInitializer(ABC):
    def __init__(self):
        pass
    def init_unit(self, source_unit):
        pass


class BaseParamInitializer(ABC):
    def __init__(self):
        pass
    def init_param(self, source_param):
        pass

class BaseStatementInitializer(ABC):
    def __init__(self):
        pass
    def init_statement(self, source_statement):
        pass

