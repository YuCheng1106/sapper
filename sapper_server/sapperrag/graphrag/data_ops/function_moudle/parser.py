from ..base_parser import BaseJsonParser
import json


class JsonParser(BaseJsonParser):
    def __init__(self):
        super(JsonParser, self).__init__()

    @staticmethod
    def parse(data, **kwargs):
        return [
            {new_key: item.get(old_key, kwargs["map"][old_key]) for old_key, new_key in kwargs["map"].items()}
            for item in json.loads(data)
        ]
