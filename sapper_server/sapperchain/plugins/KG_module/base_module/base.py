import asyncio


class Graph():
    def __init__(self, entities, relationships, communities):
        self.entities = entities
        self.relationships = relationships
        self.communities = communities

    # @property
    # async def entities(self):
    #     return self._entities
    #
    # @property
    # async def relationship_instances(self):
    #     return self._relationship_instances
    #
    # @property
    # async def community_reports(self):
    #     return self._community_reports


