"""Tool definitions for Claude Agent SDK to access database functions."""

from typing import Dict, List, Any
from research_agent.utils.db_tools import db_tools


class CreateResearchTask:
    """Create a new research task in the database."""

    name = "CreateResearchTask"
    description = "Create a new research task in the database to track research progress"

    input_schema = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The original user research question"
            },
            "subtopics": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of research angles/subtopics to investigate"
            }
        },
        "required": ["query", "subtopics"]
    }

    async def run(self, query: str, subtopics: List[str]) -> str:
        """Execute the tool and return task_id."""
        task_id = await db_tools.create_research_task(query, subtopics)
        return f"Created research task with ID: {task_id}"


class SaveSource:
    """Save a web source discovered during research."""

    name = "SaveSource"
    description = "Save a web source discovered during research to the database"

    input_schema = {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the research task"
            },
            "url": {
                "type": "string",
                "description": "Source URL from WebSearch"
            },
            "title": {
                "type": "string",
                "description": "Page title"
            },
            "content": {
                "type": "string",
                "description": "Relevant excerpt from the source"
            },
            "researcher_id": {
                "type": "string",
                "description": "Identifier of the researcher (e.g., 'RESEARCHER-1')"
            }
        },
        "required": ["task_id", "url", "title", "content", "researcher_id"]
    }

    async def run(
        self,
        task_id: str,
        url: str,
        title: str,
        content: str,
        researcher_id: str
    ) -> str:
        """Execute the tool and return source_id."""
        source_id = await db_tools.save_source(task_id, url, title, content, researcher_id)
        return f"Saved source with ID: {source_id}"


class SaveFinding:
    """Save a research finding extracted from a source."""

    name = "SaveFinding"
    description = "Save a specific research finding/fact extracted from a source"

    input_schema = {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the research task"
            },
            "source_id": {
                "type": "string",
                "description": "UUID of the source this finding came from"
            },
            "content": {
                "type": "string",
                "description": "The finding/fact/claim"
            },
            "finding_type": {
                "type": "string",
                "enum": ["statistic", "policy", "event", "general"],
                "description": "Type of finding",
                "default": "general"
            },
            "confidence": {
                "type": "number",
                "minimum": 0.0,
                "maximum": 1.0,
                "description": "Confidence score (0.0-1.0)",
                "default": 0.8
            },
            "metadata": {
                "type": "object",
                "description": "Extra structured data",
                "default": None
            }
        },
        "required": ["task_id", "source_id", "content"]
    }

    async def run(
        self,
        task_id: str,
        source_id: str,
        content: str,
        finding_type: str = 'general',
        confidence: float = 0.8,
        metadata: Dict[str, Any] = None
    ) -> str:
        """Execute the tool and return finding_id."""
        finding_id = await db_tools.save_finding(
            task_id, source_id, content, finding_type, confidence, metadata
        )
        return f"Saved finding with ID: {finding_id}"


class LoadResearchData:
    """Load all sources and findings for a research task."""

    name = "LoadResearchData"
    description = "Load all research sources and findings from the database for a task"

    input_schema = {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the research task"
            }
        },
        "required": ["task_id"]
    }

    async def run(self, task_id: str) -> str:
        """Execute the tool and return research data as formatted string."""
        data = await db_tools.load_research_data(task_id)

        # Format sources
        sources_text = f"## Sources ({len(data['sources'])} total)\n\n"
        for source in data['sources']:
            sources_text += f"**{source['title']}**\n"
            sources_text += f"- URL: {source['url']}\n"
            sources_text += f"- Researcher: {source['researcher_id']}\n"
            sources_text += f"- Content: {source['content'][:200]}...\n\n"

        # Format findings
        findings_text = f"## Findings ({len(data['findings'])} total)\n\n"
        for finding in data['findings']:
            findings_text += f"- [{finding['finding_type']}] {finding['content']}\n"
            findings_text += f"  Source: {finding['source_url']}\n"
            findings_text += f"  Confidence: {finding['confidence']}\n\n"

        return sources_text + "\n" + findings_text


class SaveSummary:
    """Save a research summary to the database."""

    name = "SaveSummary"
    description = "Save a synthesized research summary to the database"

    input_schema = {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the research task"
            },
            "content": {
                "type": "string",
                "description": "Markdown summary content"
            },
            "summary_type": {
                "type": "string",
                "enum": ["overview", "section", "final"],
                "description": "Type of summary",
                "default": "final"
            },
            "finding_ids": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of finding UUIDs to link",
                "default": None
            },
            "parent_summary_id": {
                "type": "string",
                "description": "UUID of parent summary (for hierarchical summaries)",
                "default": None
            },
            "order": {
                "type": "integer",
                "description": "Display order",
                "default": 0
            }
        },
        "required": ["task_id", "content"]
    }

    async def run(
        self,
        task_id: str,
        content: str,
        summary_type: str = 'final',
        finding_ids: List[str] = None,
        parent_summary_id: str = None,
        order: int = 0
    ) -> str:
        """Execute the tool and return summary_id."""
        summary_id = await db_tools.save_summary(
            task_id, content, summary_type, finding_ids, parent_summary_id, order
        )
        return f"Saved summary with ID: {summary_id}"


class UpdateTaskStatus:
    """Update the status of a research task."""

    name = "UpdateTaskStatus"
    description = "Update the status of a research task to track progress"

    input_schema = {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "UUID of the research task"
            },
            "status": {
                "type": "string",
                "enum": ["pending", "researching", "completed", "failed"],
                "description": "New status"
            }
        },
        "required": ["task_id", "status"]
    }

    async def run(self, task_id: str, status: str) -> str:
        """Execute the tool."""
        await db_tools.update_task_status(task_id, status)
        return f"Updated task {task_id} to status: {status}"


# Export all tools
ALL_TOOLS = [
    CreateResearchTask,
    SaveSource,
    SaveFinding,
    LoadResearchData,
    SaveSummary,
    UpdateTaskStatus
]
