from .base import BaseChunker
from abc import abstractmethod


class RegexChunker(BaseChunker):
    def __init__(self, patterns=None):
        super(RegexChunker, self).__init__()
        if patterns is None:
            patterns = [r'\n\n']  # Default split pattern
        self.patterns = patterns

    @abstractmethod
    def chunk(self, text):
        pass


class SemanticChunker(BaseChunker):
    def __init__(self, model_name, max_size):
        super(SemanticChunker, self).__init__()
        self.model_name = model_name
        self.max_size = max_size

    @abstractmethod
    def chunk(self, text):
        pass