from abc import ABC, abstractmethod

class BaseRetriever(ABC):
    def __init__(self):
        pass
    def retrieve_from_database(self, user_query, database):
        pass

class BaseRanker(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def rank(self, data):
        pass

class BaseParser(ABC):
    def __init__(self):
        pass

    def parse(self, data, **kwargs):
        pass

