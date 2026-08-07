from .base import BaseEmbeder

from typing import Any, List
import torch
import os
import asyncio
from transformers import BertModel, BertTokenizer, BertConfig


class BaseLocalModelEmbeder(BaseEmbeder):
    def __init__(self):
        super(BaseLocalModelEmbeder, self).__init__()

    def embed(self, text):
        pass




