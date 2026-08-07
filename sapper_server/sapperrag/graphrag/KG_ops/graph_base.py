
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional, List, Dict



@dataclass
class Identified:
    """A protocol for an item with an ID."""

    id: str
    """The ID of the item."""


@dataclass
class Named(Identified):
    """A protocol for an item with a name/title."""

    name: str
    """The name/title of the item."""




@dataclass
class Entity(Named):
    """A protocol for an entity in the system."""

    type: Optional[str] = None
    """Type of the entity (can be any string, optional)."""

    attributes_embedding: Optional[List[float]] = None
    """The semantic (i.e. text) embedding of the entity (optional)."""

    community_ids: Optional[List[str]] = None
    """The community IDs of the entity (optional)."""

    rank: Optional[int] = 1
    """Rank of the entity, used for sorting (optional). Higher rank indicates more important entity. This can be based on centrality or other metrics."""

    attributes: Optional[Dict[str, Any]] = None
    """Additional attributes associated with the entity (optional), e.g. start time, end time, etc. To be included in the search prompt."""

    @classmethod
    def from_dict(
        cls,
        d: dict[str, Any],
        id_key: str = "id",
        name_key: str = "name",
        type_key: str = "type",
        community_key: str = "community",
        rank_key: str = "degree",
        attributes_key: str = "attributes",
    ) -> "Entity":
        """Create a new entity from the dict data."""
        return Entity(
            id=d[id_key],
            name=d[name_key],
            type=d.get(type_key),
            community_ids=d.get(community_key),
            rank=d.get(rank_key, 1),
            attributes=d.get(attributes_key),
        )

@dataclass
class Relationship(Identified):
    """A relationship between two entities. This is a generic relationship, and can be used to represent any type of relationship between any two entities."""

    source: str
    """The source entity name."""

    target: str
    """The target entity name."""

    type: Optional[str] = None
    """The type of the relationship (optional)."""

    name: Optional[str] = None
    """The name of the relationship (optional)."""

    weight: Optional[float] = 1.0
    """The edge weight."""

    attributes: Optional[Dict[str, Any]] = None
    """Additional attributes associated with the relationship (optional). To be included in the search prompt"""

    triple_source: Optional[str] = None
    """Triplet information source"""

    @classmethod
    def from_dict(
        cls,
        d: Dict[str, Any],
        id_key: str = "id",
        type_key: str = "type",
        source_key: str = "source",
        target_key: str = "target",
        weight_key: str = "weight",
        attributes_key: str = "attributes",
        triple_source_key: str = "triple_source",
    ) -> "Relationship":
        """Create a new relationship from the dict data."""
        return Relationship(
            id=d[id_key],
            type=d.get(type_key),
            source=d[source_key],
            target=d[target_key],
            weight=d.get(weight_key, 1.0),
            attributes=d.get(attributes_key),
            triple_source=d.get(triple_source_key)
        )

@dataclass
class Community(Identified):
    """A protocol for a community in the system."""

    title: str = ""
    """Title of the community."""

    level: str = ""
    """Community level."""

    full_content: str = ""
    """Full content of the report."""

    entity_ids: list[str] | None = None
    """List of entity IDs related to the community (optional)."""

    rating: float | None = None
    """Community rating."""

    attributes: dict[str, Any] | None = None
    """A dictionary of additional attributes associated with the community (optional). To be included in the search 
    prompt."""

    @classmethod
    def from_dict(
        cls,
        d: dict[str, Any],
        id_key: str = "id",
        full_content_key: str = "full_content",
        title_key: str = "title",
        level_key: str = "level",
        entities_key: str = "entity_ids",
        attributes_key: str = "attributes"
    ) -> "Community":
        """Create a new community from the dict data."""
        return Community(
            id=d[id_key],
            title=d[title_key],
            full_content=d[full_content_key],
            level=d[level_key],
            entity_ids=d.get(entities_key),
            attributes=d.get(attributes_key),
        )