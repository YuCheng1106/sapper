from ..base_module.base_embeder import BaseLocalModelEmbeder
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from typing import Any, List
import torch
import os
import asyncio
from transformers import BertModel, BertTokenizer, BertConfig

class LocalModelEmbeder(BaseLocalModelEmbeder):
    """Implementation of text embedding using a local BERT model."""

    def __init__(self, path: str):
        super(LocalModelEmbeder, self).__init__()
        # Paths to model files
        self.model = None
        self.tokenizer = None
        self.model_loaded_event = asyncio.Event()
        model_path = "DMetaSoul/Dmeta-embedding"
        config_path = os.path.join(path, 'config.json')
        vocab_path = os.path.join(path, 'vocab.txt')

        asyncio.create_task(self._load_model(config_path, vocab_path, model_path))

    async def _load_model(self, config_path: str, vocab_path: str, model_path: str):
        try:
            # Load the configuration file asynchronously
            config = await asyncio.to_thread(BertConfig.from_pretrained, config_path)
            self.tokenizer = await asyncio.to_thread(BertTokenizer.from_pretrained, vocab_path)
            self.model = await asyncio.to_thread(BertModel.from_pretrained, model_path, config=config)

            # Mark the model as loaded
            self.model_loaded_event.set()
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model_loaded_event.set()  # Signal that model loading failed

    async def wait_for_model_to_load(self):
        """Block until the model is fully loaded."""
        await self.model_loaded_event.wait()

    async def _load_model_weights(self, model_path: str):
        state_dict = await self._load_file_async(model_path)
        self.model.load_state_dict(state_dict)

    async def _load_file_async(self, file_path: str) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: torch.load(file_path))

    def embed(self, text: str, **kwargs: Any) -> List[float]:
        try:
            # Tokenize input text
            inputs = self.tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=512)

            # Generate embeddings
            with torch.no_grad():
                outputs = self.model(**inputs)

            # Get [CLS] token vector
            cls_embedding = outputs.last_hidden_state[:, 0, :].numpy()

            return cls_embedding.flatten().tolist()
        except Exception as e:
            print(f"Error while generating embedding: {e}")
            return []

    async def aembed(self, text: str, **kwargs: Any) -> List[float]:

        try:
            # Tokenize input text
            inputs = self.tokenizer(text, return_tensors='pt')

            # Generate embeddings asynchronously
            loop = asyncio.get_event_loop()
            embedding_vector = await loop.run_in_executor(None, self._generate_embedding, inputs)

            return embedding_vector
        except Exception as e:
            print(f"Error while generating embedding: {e}")
            return []

    def _generate_embedding(self, inputs) -> List[float]:
        with torch.no_grad():
            outputs = self.model(**inputs)

        # Get [CLS] token vector
        cls_embedding = outputs.last_hidden_state[:, 0, :].numpy()

        return cls_embedding.flatten().tolist()