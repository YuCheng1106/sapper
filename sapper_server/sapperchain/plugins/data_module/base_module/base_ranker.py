from abc import ABC, abstractmethod
from typing import Any

from .base import BaseRanker
class BaseFieldRanker(BaseRanker):
    def __init__(self):
        super(BaseFieldRanker, self).__init__()
        self.rank_field = ""

    def init_field(self, rank_field):
        self.rank_field = rank_field

    def rank(self, data):
        pass