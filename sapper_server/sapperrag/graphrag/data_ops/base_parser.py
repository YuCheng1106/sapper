
from .base import BaseParser

class BaseJsonParser(BaseParser):
    def __init__(self):
        super(BaseJsonParser, self).__init__()
        pass

    def parse(self, data, **kwargs):
        pass