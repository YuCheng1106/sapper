import json
import pandas as pd
from .util import IloadGraph
from ..base import Graph
class GraphImporter:
    def __init__(self, json_parser):
        self.json_parser = json_parser
        self.entity_map = {
            'uuid': 'id', 'name': 'name', 'type': 'type', 'attributes': 'attributes',
            'embeddings': 'attributes_embedding', 'sources': 'source_ids', 'communities': 'community_ids'
        }
        self.relationship_map = {
            'uuid': 'id', 'source_entity_uuid': 'source', 'target_entity_uuid': 'target',
            'type': 'type', 'name': 'name', 'attributes': 'attributes', "source": "triple_source"
        }
        self.community_report_map = {
            'uuid': 'id', 'title': 'title', 'level': 'level', 'content': 'full_content',
            'rating': 'rating', 'attributes': 'attributes'
        }
    def __read_file(self, file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            index = json.load(f)
        return index
    def __parse_by_map(self, content):
        entities = self.json_parser.parse(content['entities'], map=self.entity_map)
        relationships = self.json_parser.parse(content['relationships'], map=self.relationship_map)
        community_reports = self.json_parser.parse(content['communities'], map=self.community_report_map)
        return entities, relationships, community_reports
    def __import_graph(self, entities, relationships, community_reports):
        entities = IloadGraph.load_entities(df=pd.DataFrame(entities))
        relationships = IloadGraph.load_relationships(df=pd.DataFrame(relationships))
        community_reports = IloadGraph.load_community_reports(df=pd.DataFrame(community_reports))
        graph = Graph(entities, relationships, community_reports)
        return graph

    def import_(self, graph):
        # content = self.__read_file(file_path)
        # entities, relationships, community_reports = self.__parse_by_map(content)
        entities = self.json_parser.parse(json.dumps(graph.get('entities', [])), map=self.entity_map)
        relationships = self.json_parser.parse(json.dumps(graph.get('relationships', [])), map=self.relationship_map)
        community_reports = self.json_parser.parse(json.dumps(graph.get('communities', [])), map=self.community_report_map)
        graph = self.__import_graph(entities, relationships, community_reports)
        return graph
