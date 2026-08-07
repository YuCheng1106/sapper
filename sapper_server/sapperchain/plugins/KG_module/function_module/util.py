import json
from ..base_module.graph_base import Entity,Relationship,Community
import tiktoken
import pandas as pd

class IloadGraph:
    @staticmethod
    def load_entities(df: pd.DataFrame):
        dataclass_list = []
        try:
            for _, row in df.iterrows():
                dataclass_list.append(Entity(
                    id=row.get('id', ''),
                    type=row.get('type', ''),
                    name=row.get('name', ''),
                    community_ids=row.get('community_ids', ''),
                    attributes=json.loads(row['attributes'].replace("'", '"')) if isinstance(row['attributes'],
                                                                                             str) else row.get(
                        'attributes', ''),
                    attributes_embedding=json.loads(row['attributes_embedding']) if isinstance(
                        row['attributes_embedding'], str) else row.get('attributes_embedding', []),
                ))
        except json.JSONDecodeError as e:
            print(f"JSONDecodeError: {e}")

        return dataclass_list

    @staticmethod
    def load_relationships(df: pd.DataFrame):
        dataclass_list = []
        for _, row in df.iterrows():
            dataclass_list.append(Relationship(
                id=row.get('id', ''),
                source=row.get('source', ''),
                target=row.get('target', ''),
                type=row.get('type', ''),
                name=row.get('name', ''),
                attributes=row.get('attributes', ''),
                triple_source=row.get('triple_source', '')
            ))
        return dataclass_list

    @staticmethod
    def load_community_reports(df: pd.DataFrame):
        dataclass_list = []
        for _, row in df.iterrows():
            dataclass_list.append(Community(
                id=row.get('id', ''),
                title=row.get('title', ''),
                level=row.get('level', ''),
                entity_ids=row.get('entity_ids', []),
                rating=row.get('rating', ''),
                full_content=row.get('full_content', '')
            ))
        return dataclass_list


def num_tokens(text: str) -> int:
    token_encoder = tiktoken.get_encoding("cl100k_base")
    """返回给定文本中的标记数"""
    return len(token_encoder.encode(text=text))

def remove_unrelated_attributes(attributes: dict) -> dict:
        attributes = {
            key: value for key, value in attributes.items()
            if key != "index" and (isinstance(value, str) and value.lower() != "unknown")
        }
        return attributes


def get_entity_information_by_id(entities, given_id):
    for entity in entities:
        if str(entity.uuid) == given_id:
            entity_information = f"{entity.name},{remove_unrelated_attributes(entity.attributes)}"
            return entity_information
