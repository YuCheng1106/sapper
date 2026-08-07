from ..base_retriever import BaseSQLRetriever, BaseRegexRetriever, BaseSemanticRetriever
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

RETRIEVER_PROMPT = '''
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
'''



class SemanticRetriever(BaseSemanticRetriever):
    def __init__(self, llm):
        super(SemanticRetriever, self).__init__()
        self.llm = llm

    def retrieve_from_database(self, user_query, database):
        pass

class PromptRetriever(BaseSemanticRetriever):
    def __init__(self, llm):
        super(PromptRetriever, self).__init__()
        self.llm = llm

    def __get_llm_response(self, user_query):
        response = self.llm.generate(user_query)
        return response

    def retrieve_from_database(self, user_query, database):
        pass


