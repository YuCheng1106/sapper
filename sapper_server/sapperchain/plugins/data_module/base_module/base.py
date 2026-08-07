from abc import ABC, abstractmethod

class BaseRetriever(ABC):
    def __init__(self):
        pass
    def retrieve_from_database(self, user_query, database, **kwargs):
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


class BaseChunker(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def chunk(self, text):
        pass

class BaseEmbeder(ABC):
    def __init__(self):
        pass

    def embed(self, text):
        pass

