import os

from ..base_module.base import FileReader
from abc import abstractmethod

class PdfReader(FileReader):
    def __init__(self):
        super(PdfReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class DocxReader(FileReader):
    def __init__(self):
        super(DocxReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class PptxReader(FileReader):
    def __init__(self):
        super(PptxReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class XlsxReader(FileReader):
    def __init__(self):
        super(XlsxReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class MdReader(FileReader):
    def __init__(self):
        super(MdReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class CsvReader(FileReader):
    def __init__(self):
        super(CsvReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class ImageReader(FileReader):
    def __init__(self):
        super(ImageReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class AudioReader(FileReader):
    def __init__(self):
        super(AudioReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass

class TxtReader(FileReader):
    def __init__(self):
        super(TxtReader, self).__init__()

    @abstractmethod
    def read(self, file_path):
        pass
