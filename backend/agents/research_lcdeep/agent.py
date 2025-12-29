"""Entry point for research agent using LangChain Deep Agents."""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from deepagents import create_deep_agent, SubAgent
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import BaseTool

from agents.mcp.client import get_mcp_client
from agents.research_lcdeep.tools import get_database_tools
from agents.research_claude.utils.db_tools import get_db_tools
from agents.tools.agent_helpers import create_truncating_tool

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


async def get_search_tools() -> list[BaseTool]:
    """
    Get BrightData and Wikipedia search tools from MCP client.

    Returns only: search_engine, scrape_as_markdown, query_wikipedia

    Optimized for reduced token usage with aggressive truncation.
    """
    from langchain_core.tools import StructuredTool

    mcp_client = get_mcp_client()
    all_tools = await mcp_client.get_tools()

    # Filter to only the tools we want
    tool_names = {"search_engine", "scrape_as_markdown", "query_wikipedia"}
    search_tools = [t for t in all_tools if t.name in tool_names]

    # Wrap with MORE aggressive truncation (20k chars = ~5k tokens instead of 40k/10k)
    MAX_CHARS_LCDEEP = 20000

    def create_truncating_tool_lcdeep(original_tool: BaseTool) -> StructuredTool:
        """Create tool with aggressive truncation for lcdeep agent."""
        async def truncated_func(**kwargs) -> str:
            result = await original_tool.ainvoke(kwargs)
            if isinstance(result, str) and len(result) > MAX_CHARS_LCDEEP:
                return f"{result[:MAX_CHARS_LCDEEP]}\n\n[... TRUNCATED - {len(result) - MAX_CHARS_LCDEEP} characters removed for efficiency ...]"
            return result

        return StructuredTool.from_function(
            coroutine=truncated_func,
            name=original_tool.name,
            description=original_tool.description,
            args_schema=original_tool.args_schema,
        )

    wrapped_tools = [create_truncating_tool_lcdeep(tool) for tool in search_tools]

    return wrapped_tools


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
    researcher_prompt = load_prompt("researcher.md")
    summarizer_prompt = load_prompt("summarizer.md")

    # Get tools
    search_tools = await get_search_tools()
    db_tools_list = get_database_tools()

    print(f"Loaded {len(search_tools)} search tools: {[t.name for t in search_tools]}")
    print(f"Loaded {len(db_tools_list)} database tools: {[t.name for t in db_tools_list]}")

    # Initialize model (using Haiku for efficiency like research_claude)
    model = ChatAnthropic(model="claude-3-5-haiku-20241022", temperature=0)

    # Define researcher subagent (gets search + save tools only)
    researcher_subagent = SubAgent(
        name="researcher",
        description=(
            "Use this agent when you need to gather research information on any topic. "
            "The researcher uses search tools (search_engine, scrape_as_markdown, query_wikipedia) "
            "to find relevant information from across the internet and Wikipedia. "
            "Saves research findings to database for later use by summarizer. "
            "Ideal for complex research tasks that require deep searching and cross-referencing."
        ),
        tools=search_tools + [t for t in db_tools_list if t.name in {"SaveSource", "SaveFinding"}],
        system_prompt=researcher_prompt,
        model=model,
    )

    # Define summarizer subagent (only gets database tools, no search)
    summarizer_subagent = SubAgent(
        name="summarizer",
        description=(
            "Use this agent to synthesize research findings into summaries. "
            "The summarizer reads research findings from the database and creates "
            "coherent summaries. Does NOT conduct searches - only reads existing "
            "research and synthesizes summaries."
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
        subagents=[researcher_subagent, summarizer_subagent],
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
    print("\nResearch any topic and store findings in database.")
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
                query=initial_query,
                subtopics=[]  # Lead agent will determine subtopics
            )
            print(f"Created research task: {task_id}")

            # Enhance prompt with task_id
            enhanced_prompt = f"{initial_query}\n\n[SYSTEM: Use task_id: {task_id} for all research]"

            # Invoke agent
            print("\nAgent: ", end="")
            result = await agent.ainvoke({
                "messages": [{"role": "user", "content": enhanced_prompt}]
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
                    query=user_input,
                    subtopics=[]  # Lead agent will determine subtopics
                )
                print(f"Created research task: {task_id}")

                # Enhance prompt with task_id
                enhanced_prompt = f"{user_input}\n\n[SYSTEM: Use task_id: {task_id} for all research]"

                # Invoke agent
                print("\nAgent: ", end="")
                result = await agent.ainvoke({
                    "messages": [{"role": "user", "content": enhanced_prompt}]
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

    query = task["query"]

    # Create agent
    agent, mcp_client, _ = await create_agent()

    try:
        # Enhance prompt with task_id
        enhanced_prompt = f"{query}\n\n[SYSTEM: Use task_id: {task_id} for all research]"

        # Invoke agent
        await agent.ainvoke({
            "messages": [{"role": "user", "content": enhanced_prompt}]
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
