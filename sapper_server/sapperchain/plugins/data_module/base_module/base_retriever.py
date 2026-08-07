from .base import BaseRetriever

class BaseSemanticRetriever(BaseRetriever):
    def __init__(self):
        super(BaseSemanticRetriever, self).__init__()

    def retrieve(self, user_query, database):
        pass


class BaseSQLRetriever(BaseRetriever):
    def __init__(self):
        super(BaseSQLRetriever, self).__init__()
        self.select_expression = ""

    def retrieve_from_database(self, user_query, database,**kwargs):
        pass

class BaseRegexRetriever(BaseRetriever):
    def __init__(self):
        super(BaseRegexRetriever, self).__init__()

    def retrieve_from_database(self, user_query, database, **kwargs):
        pass