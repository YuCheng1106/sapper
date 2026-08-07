from file_module.base_module.base import FileTypeConverter
from abc import abstractmethod

class PdfConverter(FileTypeConverter):
    def __init__(self):
        super(PdfConverter, self).__init__()
    
    @abstractmethod
    def convert(self, file_path, converted_file_type):
        pass


class DocxConverter(FileTypeConverter):
    def __init__(self):
        super(DocxConverter, self).__init__()

    @abstractmethod
    def convert(self, file_path, converted_file_type):
        pass     

class PptxConverter(FileTypeConverter):
    def __init__(self):
        super(PptxConverter, self).__init__()

    @abstractmethod
    def convert(self, file_path, converted_file_type):
        pass    