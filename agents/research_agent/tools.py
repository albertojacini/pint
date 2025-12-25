"""Tool definitions for Claude Agent SDK to access database functions."""

from typing import Dict, List, Any
from claude_agent_sdk import tool, create_sdk_mcp_server
from research_agent.utils.db_tools import get_db_tools


@tool(
    "CreateResearchTask",
    "Create a new research task in the database to track research progress",
    {"query": str, "subtopics": list}
)
async def create_research_task_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new research task in the database."""
    db_tools = get_db_tools()
    task_id = await db_tools.create_research_task(args["query"], args["subtopics"])
    return {
        "content": [{
            "type": "text",
            "text": f"Created research task with ID: {task_id}"
        }]
    }


@tool(
    "SaveSource",
    "Save a web source discovered during research to the database",
    {
        "task_id": str,
        "url": str,
        "title": str,
        "content": str,
        "researcher_id": str
    }
)
async def save_source_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Save a web source to the database."""
    db_tools = get_db_tools()
    source_id = await db_tools.save_source(
        args["task_id"],
        args["url"],
        args["title"],
        args["content"],
        args["researcher_id"]
    )
    return {
        "content": [{
            "type": "text",
            "text": f"Saved source with ID: {source_id}"
        }]
    }


@tool(
    "SaveFinding",
    "Save a specific research finding/fact extracted from a source",
    {
        "task_id": str,
        "source_id": str,
        "content": str,
        "finding_type": str,
        "confidence": float,
        "metadata": dict
    }
)
async def save_finding_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Save a research finding to the database."""
    db_tools = get_db_tools()
    finding_id = await db_tools.save_finding(
        args["task_id"],
        args["source_id"],
        args["content"],
        args.get("finding_type", "general"),
        args.get("confidence", 0.8),
        args.get("metadata")
    )
    return {
        "content": [{
            "type": "text",
            "text": f"Saved finding with ID: {finding_id}"
        }]
    }


@tool(
    "LoadResearchData",
    "Load all research sources and findings from the database for a task",
    {"task_id": str}
)
async def load_research_data_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Load all sources and findings for a research task."""
    db_tools = get_db_tools()
    data = await db_tools.load_research_data(args["task_id"])

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

    return {
        "content": [{
            "type": "text",
            "text": sources_text + "\n" + findings_text
        }]
    }


@tool(
    "SaveSummary",
    "Save a synthesized research summary to the database",
    {
        "task_id": str,
        "content": str,
        "summary_type": str,
        "finding_ids": list,
        "parent_summary_id": str,
        "order": int
    }
)
async def save_summary_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Save a research summary to the database."""
    db_tools = get_db_tools()
    summary_id = await db_tools.save_summary(
        args["task_id"],
        args["content"],
        args.get("summary_type", "final"),
        args.get("finding_ids"),
        args.get("parent_summary_id"),
        args.get("order", 0)
    )
    return {
        "content": [{
            "type": "text",
            "text": f"Saved summary with ID: {summary_id}"
        }]
    }


@tool(
    "UpdateTaskStatus",
    "Update the status of a research task to track progress",
    {
        "task_id": str,
        "status": str
    }
)
async def update_task_status_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Update task status."""
    db_tools = get_db_tools()
    await db_tools.update_task_status(args["task_id"], args["status"])
    return {
        "content": [{
            "type": "text",
            "text": f"Updated task {args['task_id']} to status: {args['status']}"
        }]
    }


# Create and export MCP server
research_tools_server = create_sdk_mcp_server(
    name="research-tools",
    version="1.0.0",
    tools=[
        create_research_task_tool,
        save_source_tool,
        save_finding_tool,
        load_research_data_tool,
        save_summary_tool,
        update_task_status_tool
    ]
)
