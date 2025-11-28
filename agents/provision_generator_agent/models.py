"""Data models for the provision generator agent."""

from enum import Enum
from pydantic import BaseModel


class ProvisionType(str, Enum):
    OWNERSHIP = "ownership"
    CONTRACT = "contract"
    REGULATION = "regulation"
    TAXATION = "taxation"
    ALLOCATION = "allocation"
    DESIGNATION = "designation"


class ProvisionStatus(str, Enum):
    ACTIVE = "active"
    REPEALED = "repealed"
    SUSPENDED = "suspended"


class ScrapedPage(BaseModel):
    """Result of scraping a URL."""

    url: str
    markdown_content: str


class CandidateProvision(BaseModel):
    """A provision candidate extracted from a webpage."""

    title: str
    type: ProvisionType
    description: str
    effective_from: str | None = None
    source_url: str
    source_snippet: str | None = None


class DedupStatus(str, Enum):
    NEW = "new"
    DUPLICATE = "duplicate"
    SIMILAR = "similar"


class DedupResult(BaseModel):
    """Result of deduplication check."""

    candidate: CandidateProvision
    status: DedupStatus
    similar_to: list[str] = []  # titles of similar provisions


class ReviewDecision(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    EDIT = "edit"
    SKIP = "skip"
    QUIT = "quit"
