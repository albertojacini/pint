"""Pydantic models for entity information extraction matching the political_entities schema."""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import date


# Sub-models for nested structures
class MayorInfo(BaseModel):
    """Information about the current mayor."""
    name: Optional[str] = None
    party: Optional[str] = None
    since: Optional[str] = None
    term_ends: Optional[str] = None


class ElectionInfo(BaseModel):
    """Information about an election."""
    date: Optional[str] = None
    type: Optional[str] = None  # e.g., "municipal", "regional"
    turnout: Optional[float] = None
    winner: Optional[str] = None
    winner_party: Optional[str] = None


class CouncilParty(BaseModel):
    """Information about a political party in the council."""
    party: str
    seats: int
    percentage: Optional[float] = None
    role: Optional[str] = None  # e.g., "majority", "opposition"


class EntityIdentityData(BaseModel):
    """Identity data for the political entity."""
    country_code: Optional[str] = Field(None, description="ISO country code")
    region_name: Optional[str] = Field(None, description="Region or state name")
    city_type: Optional[str] = Field(None, description="Type of city (e.g., comune, municipality)")
    coat_of_arms_url: Optional[str] = Field(None, description="URL to coat of arms image")
    official_website: Optional[str] = Field(None, description="Official government website")
    sister_cities: Optional[List[str]] = Field(default_factory=list, description="List of sister cities")
    postal_codes: Optional[List[str]] = Field(default_factory=list, description="Postal codes")
    phone_prefix: Optional[str] = Field(None, description="Phone area code")


class EntityEssentialStats(BaseModel):
    """Essential statistics for the political entity."""
    area: Optional[float] = Field(None, description="Area in square kilometers")
    density: Optional[float] = Field(None, description="Population density per square kilometer")
    gdp_per_capita: Optional[float] = Field(None, description="GDP per capita in EUR")
    timezone: Optional[str] = Field(None, description="Timezone (e.g., CET)")
    languages: Optional[List[str]] = Field(default_factory=list, description="Official languages")
    elevation: Optional[float] = Field(None, description="Elevation in meters")
    founded: Optional[str] = Field(None, description="Foundation date or year")
    demonym: Optional[str] = Field(None, description="Name for inhabitants (e.g., Bolognese)")
    patron_saint: Optional[str] = Field(None, description="Patron saint if applicable")


class PoliticalLandscape(BaseModel):
    """Political landscape information."""
    current_mayor: Optional[MayorInfo] = None
    last_election: Optional[ElectionInfo] = None
    next_election: Optional[ElectionInfo] = None
    council_composition: Optional[List[CouncilParty]] = Field(default_factory=list)
    government_type: Optional[str] = Field(None, description="Type of government")
    administrative_divisions: Optional[int] = Field(None, description="Number of districts/quartieri")


class PerformanceIndicators(BaseModel):
    """Performance indicators for the entity."""
    innovation: Optional[Dict[str, Any]] = Field(default_factory=dict)
    sustainability: Optional[Dict[str, Any]] = Field(default_factory=dict)
    impact: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CommunityMetrics(BaseModel):
    """Community engagement metrics."""
    user_satisfaction: Optional[float] = Field(None, description="User satisfaction score")
    active_projects: Optional[int] = Field(None, description="Number of active projects")
    engagement_level: Optional[str] = Field(None, description="Overall engagement level")


# Main model for complete entity information
class CompleteEntityInfo(BaseModel):
    """Complete information about a political/administrative entity."""
    # Basic fields
    name: str = Field(..., description="Official name of the entity")
    description: Optional[str] = Field(None, description="Brief description of the entity")
    type: str = Field(..., description="Type of entity (e.g., city, region, country)")
    population: Optional[int] = Field(None, description="Current population")
    avatar_url: Optional[str] = Field(None, description="URL to representative image (coat of arms)")

    # JSONB fields as nested models
    identity_data: Optional[EntityIdentityData] = None
    essential_stats: Optional[EntityEssentialStats] = None
    political_landscape: Optional[PoliticalLandscape] = None
    performance_indicators: Optional[PerformanceIndicators] = None
    community_metrics: Optional[CommunityMetrics] = None

    # Scores (initially null, calculated later)
    score_innovation: Optional[float] = Field(None, ge=0, le=100)
    score_sustainability: Optional[float] = Field(None, ge=0, le=100)
    score_impact: Optional[float] = Field(None, ge=0, le=100)


# Models for intermediate processing steps
class WikipediaRanking(BaseModel):
    """Model for ranking Wikipedia search results."""
    rankings: List[int] = Field(
        ...,
        description="Ordered list of indices representing the ranking from best to worst match"
    )
    reasoning: str = Field(
        ...,
        description="Brief explanation of the ranking logic"
    )


class SERPResult(BaseModel):
    """Model for SERP search results."""
    title: str
    url: str
    snippet: Optional[str] = None
    is_wikipedia: bool = False
    is_official: bool = False


class WebsiteContent(BaseModel):
    """Model for scraped website content."""
    url: str
    title: Optional[str] = None
    content: str
    metadata: Optional[Dict[str, Any]] = None
    scraped_at: Optional[str] = None