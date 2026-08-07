from ....plugins.data_module.base_module.base_retriever import BaseSQLRetriever, BaseRegexRetriever, BaseSemanticRetriever
from .embeder import LocalModelEmbeder
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from ...model_module.function_moudle.llm_call.openai_ import ChatModel, EmbeddingModel
EXTRACT_ENTITIES_FROM_QUERY = """
You are a helpful assistant that helps a human analyst identify all the named entities present in the input query, as well as general concepts that may be important for answering the query.
Each element you extract will be used to search a knowledge base to gather relevant information to answer the query.When querying entities, pay attention to the protagonist entities that are
useful for retrieval and do not extract some irrelevant supporting actors.

Extract only nouns from questions, not verbs.

Remember not to extract entity names that are not in the question, and don't make them up.

And in order of importance, from top to bottom.

# GOAL
Given the input query, identify all named entities and concepts present in the query.

Return output as a well-formed JSON-formatted string with the following format:
["entity1", "entity2", "entity3"]

# INPUT
query: {query}

"""
class SemanticRetriever(BaseSemanticRetriever):
    def __init__(self, llm):
        super(SemanticRetriever, self).__init__()
        self.llm = llm

    def retrieve(self, user_query, database):
        pass

class TextDataRetriever(SemanticRetriever):
    def __init__(self, embedding_model_path):
        super(TextDataRetriever, self).__init__(embedding_model_path)
        self.embedding_model = LocalModelEmbeder(embedding_model_path)

    async def retrieve(self, user_query, text_view,**kwargs):
        db_data = text_view.text_blocks
        await self.embedding_model.wait_for_model_to_load()
        query_embed = self.embedding_model.embed(user_query)
        query_vector = np.array(query_embed, dtype=np.float32).reshape(1, -1)
        for emb in db_data:
            stored_emb = np.array(emb.embedding, dtype=np.float32).reshape(1, -1)
            emb.similarity = cosine_similarity(query_vector, stored_emb)[0][0]
        sorted_embeddings = sorted(db_data, key=lambda x: x.similarity, reverse=True)
        result = ""
        for emb in sorted_embeddings[:10]:
            result += emb.content
        return result

class GraphDataRetriever(SemanticRetriever):
    def __init__(self,embedding_model, extract_model,sub_graph_extractor,ranker,context_builder):
        super(GraphDataRetriever, self).__init__(embedding_model)
        # self.extract_model = ChatModel(
        #     base_url="https://api.example.com/v1",
        #     api_key="replace-with-your-api-key",
        #     model_name="gpt-4o",
        #     system_prompt="",
        #     output_format=EntityExtractedRes
        # )
        # self.embedding_model = EmbeddingModel(
        #     base_url="https://api.example.com/v1",
        #     api_key="replace-with-your-api-key",
        #     model_name="text-embedding-3-small"
        # )
        self.extract_model = extract_model
        self.embedding_model = embedding_model
        # self.graph_importer = graph_importer
        # self.json_parser = JsonParser()
        # self.graph_importer = GraphImporter(self.json_parser)
        self.sub_graph_extractor = sub_graph_extractor
        self.ranker = ranker
        self.context_builder = context_builder

    async def __extract_entities_by_llm(self, user_input,):
        entities = []
        extract_prompt = EXTRACT_ENTITIES_FROM_QUERY.format(query=user_input)
        extracted_res = await self.extract_model.generate(extract_prompt)
        for entity in extracted_res.entities:
            entities.append(entity.content)
        return entities


    def __retrieve_entity(self, queries, database):
        if not queries:
            return []

        entities_list = []

        for entity_name, extracted_embed in queries.items():
            similarities = []

            for entity in database:
                entity_embed = np.array(entity.embeddings)
                if entity_embed.ndim == 1:
                    entity_embed = entity_embed.reshape(1, -1)

                similarity = cosine_similarity(extracted_embed, entity_embed)[0][0]
                similarities.append((entity, similarity))

            entities_list.extend(similarities)

        # ==================
        entities_list.sort(key=lambda x: x[1], reverse=True)
        top_k_entities = [entity for entity, similarity in entities_list[:10]]

        # 去重
        unique_top_k_entities = list({entity.uuid: entity for entity in top_k_entities}.values())

        return unique_top_k_entities

    def __extract_subgraph_from_graph(self, retrieved_entities, graph):
        subgraph = self.sub_graph_extractor.extract_by_entities(retrieved_entities, graph)
        return subgraph

    def __build_context(self, subgraph):
        context_str, context_df = self.context_builder.build_context(subgraph)
        return context_str, context_df

    async def retrieve(self, search_query, graph):

        # graph = self.graph_importer.import_(graph)
        entities = await self.__extract_entities_by_llm(search_query)

        entity_embedding = {}
        for entity in entities:
            embedding = np.array(await self.embedding_model.generate(entity))
            if embedding.ndim == 1:
                embedding = embedding.reshape(1, -1)

            entity_embedding[entity] = embedding
        retrieved_entities = self.__retrieve_entity(entity_embedding, graph.entities)
        subgraph = self.__extract_subgraph_from_graph(retrieved_entities, graph)
        context_str, context_df = self.__build_context(subgraph)
        return context_str


class PromptRetriever(BaseSemanticRetriever):
    def __init__(self, llm, prompt):
        super(PromptRetriever, self).__init__()
        self.llm = llm
        self.prompt = prompt

    def __get_llm_response(self, user_query):
        response = self.llm.generate(user_query)
        return response

    def retrieve_from_database(self, user_query, database, **kwargs):
        model_input = self.prompt.format(query=user_query+database)
        retrieved_data = self.__get_llm_response(model_input)
        return retrieved_data

class RegexRetriever(BaseRegexRetriever):
    def __init__(self):
        super(RegexRetriever, self).__init__()
    def retrieve_from_database(self, user_query, database, **kwargs):
        pass

