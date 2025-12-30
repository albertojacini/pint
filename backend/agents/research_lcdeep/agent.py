"""Entry point for research agent using LangChain Deep Agents.

SCOPE: Domain-agnostic information gathering only
------------------------------------------------------
This research agent is responsible for:
- Evaluating search results for relevance and reliability
- Saving evaluated sources with auto-scraped content to database (ra_* tables)
- Synthesizing source content into research summaries (markdown)

This research agent is NOT responsible for:
- Provision-specific decisions (type, relevance, confidence)
- Business logic or schema enforcement
- Structuring data for provision format

The research agent is domain-agnostic and could be used for any research task,
not just provisions. All provision-specific logic belongs in the provision service.
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from deepagents import create_deep_agent, SubAgent
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import BaseTool, StructuredTool

from agents.mcp.client import get_mcp_client
from agents.research_lcdeep.tools import get_database_tools, set_source_loader
from agents.research_lcdeep.source_loader import SourceLoader
from agents.research_lcdeep.config import MAIN_MODEL, SUMMARIZER_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS
from agents.utils.db_tools import get_db_tools
from agents.utils.task_context import set_current_task_id

# Paths to prompt files
PROMPTS_DIR = Path(__file__).parent / "prompts"

# Load environment variables from agents directory
agents_dir = Path(__file__).parent.parent
load_dotenv(agents_dir / ".env")


def load_prompt(filename: str) -> str:
    """Load a prompt from the prompts directory."""
    prompt_path = PROMPTS_DIR / filename
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


async def get_search_tools() -> tuple[list[BaseTool], BaseTool, BaseTool]:
    """
    Get BrightData search tools and internal tools from MCP client.

    Returns:
        Tuple of (search_tools, scrape_tool, wikipedia_tool)
        - search_tools: search_engine, query_wikipedia (for agent to use)
        - scrape_tool: scrape_as_markdown (for SourceLoader)
        - wikipedia_tool: query_wikipedia (for SourceLoader)

    The scrape and wikipedia tools are used internally by SourceLoader
    for fetching content, not exposed directly to the evaluator agent.
    """
    mcp_client = get_mcp_client()
    all_tools = await mcp_client.get_tools()

    # Search tools for the agent (no scrape - that's internal)
    search_tool_names = {"search_engine", "query_wikipedia"}
    search_tools = [t for t in all_tools if t.name in search_tool_names]

    # Tools for internal use by SourceLoader
    scrape_tool = next((t for t in all_tools if t.name == "scrape_as_markdown"), None)
    wikipedia_tool = next((t for t in all_tools if t.name == "query_wikipedia"), None)

    # Wrap search tools with truncation for token efficiency
    MAX_CHARS = 20000

    def create_truncating_tool(original_tool: BaseTool) -> StructuredTool:
        """Create tool with aggressive truncation."""
        async def truncated_func(**kwargs) -> str:
            result = await original_tool.ainvoke(kwargs)
            if isinstance(result, str) and len(result) > MAX_CHARS:
                return f"{result[:MAX_CHARS]}\n\n[... TRUNCATED - {len(result) - MAX_CHARS} chars removed ...]"
            return result

        return StructuredTool.from_function(
            coroutine=truncated_func,
            name=original_tool.name,
            description=original_tool.description,
            args_schema=original_tool.args_schema,
        )

    wrapped_search_tools = [create_truncating_tool(tool) for tool in search_tools]

    return wrapped_search_tools, scrape_tool, wikipedia_tool


async def create_agent():
    """
    Create the research deep agent with subagents.

    Returns:
        Tuple of (agent, mcp_client, db_tools)
    """
    # Check API key first
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ValueError(
            "ANTHROPIC_API_KEY not found. "
            "Set it in a .env file or export it in your shell. "
            "Get your key at: https://console.anthropic.com/settings/keys"
        )

    # Load prompts
    lead_agent_prompt = load_prompt("lead_agent.md")
    evaluator_prompt = load_prompt("evaluator.md")
    summarizer_prompt = load_prompt("summarizer.md")

    # Get tools - search tools for agent, scrape/wikipedia tools for SourceLoader
    search_tools, scrape_tool, wikipedia_tool = await get_search_tools()
    db_tools_list = get_database_tools()

    # Initialize model for summarization (same model as agent for consistency)
    summarizer_model = ChatAnthropic(
        model=SUMMARIZER_MODEL,
        temperature=DEFAULT_TEMPERATURE,
        max_tokens=DEFAULT_MAX_TOKENS
    )

    # Create and set SourceLoader for internal use by SaveSource
    source_loader = SourceLoader(
        scrape_tool=scrape_tool,
        wikipedia_tool=wikipedia_tool,
        model=summarizer_model
    )
    set_source_loader(source_loader)
    print(f"SourceLoader initialized (scrape: {scrape_tool is not None}, wikipedia: {wikipedia_tool is not None})")

    print(f"Loaded {len(search_tools)} search tools: {[t.name for t in search_tools]}")
    print(f"Loaded {len(db_tools_list)} database tools: {[t.name for t in db_tools_list]}")

    # Initialize model (using Haiku for efficiency)
    model = ChatAnthropic(model=MAIN_MODEL, temperature=DEFAULT_TEMPERATURE)

    # Define search_evaluator subagent (gets search + SaveSource only)
    search_evaluator_subagent = SubAgent(
        name="search_evaluator",
        description=(
            "Use this agent to evaluate search results for relevance and reliability. "
            "The evaluator searches for information using search_engine and query_wikipedia, "
            "then evaluates source quality and saves high-quality sources with scores. "
            "Sources are automatically scraped when saved. Does NOT extract findings - "
            "just evaluates and saves sources with relevance/reliability scores."
        ),
        tools=search_tools + [t for t in db_tools_list if t.name == "SaveSource"],
        system_prompt=evaluator_prompt,
        model=model,
    )

    # Define summarizer subagent (only gets database tools, no search)
    summarizer_subagent = SubAgent(
        name="summarizer",
        description=(
            "Use this agent to synthesize research into summaries. "
            "The summarizer reads raw source content from the database and creates "
            "coherent summaries. Does NOT conduct searches - only reads existing "
            "source content and synthesizes summaries."
        ),
        tools=[t for t in db_tools_list if t.name in {"LoadResearchData", "SaveSummary"}],
        system_prompt=summarizer_prompt,
        model=model,
    )

    # Create lead agent (only gets `task` tool for delegation - built-in)
    agent = create_deep_agent(
        model=model,
        tools=[],  # Lead agent only uses built-in `task` tool for delegation
        system_prompt=lead_agent_prompt,
        subagents=[search_evaluator_subagent, summarizer_subagent],
    )

    # Get MCP client and db_tools for cleanup
    mcp_client = get_mcp_client()
    db_tools = get_db_tools()

    return agent, mcp_client, db_tools


async def chat(initial_query: str = None):
    """
    Start interactive chat with the research agent.

    Args:
        initial_query: Optional query to run immediately instead of interactive mode
    """
    print("\n" + "=" * 50)
    print("  Research Agent (LangChain Deep Agents)")
    print("=" * 50)
    print("\nResearch any topic and store sources in database.")
    if not initial_query:
        print("\nType 'exit' to quit.\n")

    # Create agent
    agent, mcp_client, db_tools = await create_agent()

    # Initialize database connection
    await db_tools.connect()

    try:
        # If initial query provided, run it once and exit
        if initial_query:
            print(f"\nYou: {initial_query}")

            # Create research task in database first
            task_id = await db_tools.create_research_task(
                input_text=initial_query
            )
            print(f"Created research task: {task_id}")

            # Set task_id in context
            set_current_task_id(task_id)

            # Invoke agent
            print("\nAgent: ", end="")
            result = await agent.ainvoke({
                "messages": [{"role": "user", "content": initial_query}]
            })

            # Print response
            if result and "messages" in result:
                for msg in result["messages"]:
                    if hasattr(msg, "content") and isinstance(msg.content, str):
                        print(msg.content)

            print(f"\nResearch complete! Task ID: {task_id}")
        else:
            # Interactive mode
            while True:
                # Get input
                try:
                    user_input = input("\nYou: ").strip()
                except (EOFError, KeyboardInterrupt):
                    break

                if not user_input or user_input.lower() in ["exit", "quit", "q"]:
                    break

                # Create research task in database
                task_id = await db_tools.create_research_task(
                    input_text=user_input
                )
                print(f"Created research task: {task_id}")

                # Set task_id in context
                set_current_task_id(task_id)

                # Invoke agent
                print("\nAgent: ", end="")
                result = await agent.ainvoke({
                    "messages": [{"role": "user", "content": user_input}]
                })

                # Print response
                if result and "messages" in result:
                    for msg in result["messages"]:
                        if hasattr(msg, "content") and isinstance(msg.content, str):
                            print(msg.content)

                print(f"\nResearch complete! Task ID: {task_id}")
    finally:
        # Cleanup
        await db_tools.close()
        # Note: MCP client cleanup is automatic with context manager
        print("\n\nGoodbye!")


async def run(task_id: str) -> str:
    """
    Run research for an existing task. API-callable, non-interactive.

    Args:
        task_id: UUID of an existing research task in the database

    Returns:
        task_id when complete
    """
    # Load environment variables
    agents_dir = Path(__file__).parent.parent
    load_dotenv(agents_dir / ".env")

    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ValueError("ANTHROPIC_API_KEY not found")

    # Initialize database connection and load task
    db_tools = get_db_tools()
    await db_tools.connect()

    task = await db_tools.get_task(task_id)
    if not task:
        await db_tools.close()
        raise ValueError(f"Task not found: {task_id}")

    query = task["input"]

    # Create agent
    agent, mcp_client, _ = await create_agent()

    try:
        # Set task_id in context for all tool calls
        set_current_task_id(task_id)

        # Invoke agent (no need to pass task_id - it's in context)
        await agent.ainvoke({
            "messages": [{"role": "user", "content": query}]
        })

        # Mark task as completed
        await db_tools.update_task_status(task_id, "completed")

    except Exception as e:
        # Mark task as failed
        await db_tools.update_task_status(task_id, "failed")
        raise
    finally:
        await db_tools.close()

    return task_id


if __name__ == "__main__":
    # Parse command line arguments
    query = None
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])

    asyncio.run(chat(initial_query=query))
