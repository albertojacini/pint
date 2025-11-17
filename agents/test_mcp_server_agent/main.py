from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from dotenv import load_dotenv
import asyncio
from langchain.chat_models import init_chat_model
import os



load_dotenv()

model = init_chat_model("openai:gpt-4.1")

# Get BrightData token from environment
brightdata_token = os.getenv("BRIGHTDATA_API_KEY")
if not brightdata_token:
    raise ValueError("BRIGHTDATA_API_KEY environment variable is not set")

client = MultiServerMCPClient({
    "brightdata": {
        "url": f"https://mcp.brightdata.com/sse?token={brightdata_token}",
        "transport": "sse",
    },
    "wikipedia": {
        "command": "python",
        "args": ["/Users/albertojacini/Projects/pint/agents/wikipedia_mcp_server.py"],
        "transport": "stdio",
    }
})

async def chat_with_agent():
    # Get tools from the MCP client
    tools = await client.get_tools()
    print("TOOLS: ----------------")
    print(tools)
    agent = create_agent(model, tools)

    print("Type 'exit' or 'quit' to end the chat.")
    print(f"Connected with {len(tools)} tools from MCP servers (BrightData + Wikipedia)\n")

    while True:
        user_input = input("\nYou: ")
        if user_input.strip().lower() in {"exit", "quit"}:
            print("Goodbye!")
            break

        # Call the agent
        agent_response = await agent.ainvoke({"messages": [{"role": "user", "content": user_input}]})

        # Extract agent's reply
        ai_message = agent_response["messages"][-1].content
        print(f"\nAgent: {ai_message}")


if __name__ == "__main__":
    asyncio.run(chat_with_agent())