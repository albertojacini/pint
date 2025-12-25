"""Entry point for research agent using AgentDefinition for subagents."""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, AgentDefinition, HookMatcher

from research_agent.utils.subagent_tracker import SubagentTracker
from research_agent.utils.transcript import setup_session, TranscriptWriter
from research_agent.utils.message_handler import process_assistant_message
from research_agent.utils.db_tools import db_tools
from research_agent.tools import ALL_TOOLS

# Load environment variables
load_dotenv()

# Paths to prompt files
PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_prompt(filename: str) -> str:
    """Load a prompt from the prompts directory."""
    prompt_path = PROMPTS_DIR / filename
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


async def chat(initial_query: str = None):
    """Start interactive chat with the research agent.

    Args:
        initial_query: Optional query to run immediately instead of interactive mode
    """

    # Check API key first, before creating any files
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("\nError: ANTHROPIC_API_KEY not found.")
        print("Set it in a .env file or export it in your shell.")
        print("Get your key at: https://console.anthropic.com/settings/keys\n")
        return

    # Setup session directory and transcript
    transcript_file, session_dir = setup_session()

    # Create transcript writer
    transcript = TranscriptWriter(transcript_file)

    # Load prompts
    lead_agent_prompt = load_prompt("lead_agent.txt")
    researcher_prompt = load_prompt("researcher.txt")
    summarizer_prompt = load_prompt("summarizer.txt")

    # Initialize subagent tracker with transcript writer and session directory
    tracker = SubagentTracker(transcript_writer=transcript, session_dir=session_dir)

    # Initialize database connection
    await db_tools.connect()

    # Define specialized subagents
    agents = {
        "researcher": AgentDefinition(
            description=(
                "Use this agent when you need to gather research information on any topic. "
                "The researcher uses web search to find relevant information, articles, and sources "
                "from across the internet. Saves research findings to database "
                "for later use by summarizer. Ideal for complex research tasks "
                "that require deep searching and cross-referencing."
            ),
            tools=["WebSearch", "SaveSource", "SaveFinding"],
            prompt=researcher_prompt,
            model="haiku"
        ),
        "summarizer": AgentDefinition(
            description=(
                "Use this agent to synthesize research findings into summaries. "
                "The summarizer reads research findings from the database and creates "
                "coherent summaries. Does NOT conduct web searches - only reads existing "
                "research and synthesizes summaries."
            ),
            tools=["LoadResearchData", "SaveSummary"],
            prompt=summarizer_prompt,
            model="haiku"
        )
    }

    # Set up hooks for tracking
    hooks = {
        'PreToolUse': [
            HookMatcher(
                matcher=None,  # Match all tools
                hooks=[tracker.pre_tool_use_hook]
            )
        ],
        'PostToolUse': [
            HookMatcher(
                matcher=None,  # Match all tools
                hooks=[tracker.post_tool_use_hook]
            )
        ]
    }

    options = ClaudeAgentOptions(
        permission_mode="bypassPermissions",
        setting_sources=["project"],  # Load skills from project .claude directory
        system_prompt=lead_agent_prompt,
        allowed_tools=["Task", "CreateResearchTask", "UpdateTaskStatus"],
        agents=agents,
        hooks=hooks,
        custom_tools=ALL_TOOLS,
        model="haiku"
    )

    print("\n" + "=" * 50)
    print("  Research Agent")
    print("=" * 50)
    print("\nResearch any topic and store findings in database.")
    if not initial_query:
        print("\nType 'exit' to quit.\n")

    try:
        async with ClaudeSDKClient(options=options) as client:
            # If initial query provided, run it once and exit
            if initial_query:
                print(f"\nYou: {initial_query}")
                transcript.write_to_file(f"\nYou: {initial_query}\n")

                # Send to agent
                await client.query(prompt=initial_query)

                transcript.write("\nAgent: ", end="")

                # Stream and process response
                async for msg in client.receive_response():
                    if type(msg).__name__ == 'AssistantMessage':
                        process_assistant_message(msg, tracker, transcript)

                transcript.write("\n")
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

                    # Write user input to transcript (file only, not console)
                    transcript.write_to_file(f"\nYou: {user_input}\n")

                    # Send to agent
                    await client.query(prompt=user_input)

                    transcript.write("\nAgent: ", end="")

                    # Stream and process response
                    async for msg in client.receive_response():
                        if type(msg).__name__ == 'AssistantMessage':
                            process_assistant_message(msg, tracker, transcript)

                    transcript.write("\n")
    finally:
        transcript.write("\n\nGoodbye!\n")
        transcript.close()
        tracker.close()
        await db_tools.close()
        print(f"\nSession logs saved to: {session_dir}")
        print(f"  - Transcript: {transcript_file}")
        print(f"  - Tool calls: {session_dir / 'tool_calls.jsonl'}")


if __name__ == "__main__":
    # Parse command line arguments
    query = None
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])

    asyncio.run(chat(initial_query=query))
