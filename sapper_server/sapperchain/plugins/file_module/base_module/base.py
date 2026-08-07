from abc import ABC, abstractmethod

class FileReader(ABC):
    def __init__(self):
        pass
        
    @abstractmethod
    def read(self, file_path):
        pass

class FileTypeConverter(ABC):
    def __init__(self):
        pass
        
    @abstractmethod
    def convert(self, file_path, target_file_type):
        pass

class Chunker(ABC):
    def __init__(self):
        pass
        
    @abstractmethod
    def chunk(self, text):
        pass