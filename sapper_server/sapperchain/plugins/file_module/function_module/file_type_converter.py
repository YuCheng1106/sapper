from file_module.base_module.base_converter import PdfConverter, DocxConverter, PptxConverter
from .third_party_lib.docling.docling_server import FileConverter
import os
#docling support
class PdfConverterBasedDocling(PdfConverter):
    def __init__(self):
        super(PdfConverterBasedDocling, self).__init__()

        self.file_converter = FileConverter()

    def __convert_md(self, file_path):
        text = self.file_converter.convert_to(file_path,"md")
        return text

    def convert(self, file_path, converted_file_type):
        file_extension = os.path.splitext(file_path)[1].lower().strip('.')
        if file_extension == 'md':
            text = self.__convert_md(file_path)
        else:
            pass
        return text

class DocxConverterBasedDocling(DocxConverter):
    def __init__(self):
        super(DocxConverterBasedDocling, self).__init__()
        self.file_converter = FileConverter()

    def __convert_md(self, file_path):
        text = self.file_converter.convert_to(file_path,'md')
        return text

    def convert(self, file_path, converted_file_type):
        if converted_file_type == 'md':
            text = self.__convert_md(file_path)
        else:
            pass
        return text

class PptxConverterBasedDocling(PptxConverter):
    def __init__(self):
        super(PptxConverterBasedDocling, self).__init__()
        self.file_converter = FileConverter()

    def __convert_md(self, file_path):
        text = self.file_converter.convert_to(file_path,"md")
        return text

    def convert(self, file_path, converted_file_type):
        if converted_file_type == 'md':
            text = self.__convert_md(file_path)
        else:
            pass
        return text