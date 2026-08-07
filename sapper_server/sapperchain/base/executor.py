from abc import ABC


class BaseAgentExecutor(ABC):
    def __init__(self, chain_initializer, chain_executor):
        self.chain_initializer = chain_initializer
        self.chain_executor = chain_executor

    def init_chain(self, chain):
        pass

    def run_chain(self, chain):
        pass

class BaseChainExecutor(ABC):
    def __init__(self):
        pass

    def run_chain(self, chain):
        pass

class BaseUnitExecutor(ABC):
    def __init__(self):
        pass
    def run_unit(self, unit, global_params):
        pass

class BaseStatementExecutor(ABC):
    def __init__(self):
        pass
    def run_statement(self, statement):
        pass
