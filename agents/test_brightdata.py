"""Test BrightData MCP connection."""
import asyncio
import os
from dotenv import load_dotenv
import httpx

async def test_brightdata_endpoint():
    """Test if BrightData endpoints are reachable."""
    load_dotenv()

    token = os.getenv("BRIGHTDATA_API_KEY")
    if not token:
        print("❌ BRIGHTDATA_API_KEY not found in environment")
        return

    print(f"✓ API Key found: {token[:8]}...{token[-4:]}")

    # Test both endpoints
    endpoints = [
        ("SSE", f"https://mcp.brightdata.com/sse?token={token}"),
        ("MCP", f"https://mcp.brightdata.com/mcp?token={token}"),
    ]

    for name, url in endpoints:
        print(f"\n{'='*60}")
        print(f"Testing {name} endpoint: {url}")
        print('='*60)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                print("Sending request...")
                response = await client.get(url)
                print(f"✓ Response status: {response.status_code}")
                print(f"✓ Response headers: {dict(response.headers)}")
                print(f"✓ Response body (first 500 chars): {response.text[:500]}")
        except httpx.TimeoutException:
            print("❌ Request timed out after 10 seconds")
        except httpx.ConnectError as e:
            print(f"❌ Connection error: {e}")
        except Exception as e:
            print(f"❌ Error: {type(e).__name__}: {e}")

async def test_with_mcp_client():
    """Test using the MCP client directly."""
    from utils.mcp_client import get_mcp_client

    print("\n" + "="*60)
    print("Testing with MCP Client (BrightData with SSE)")
    print("="*60)

    print("Creating MCP client with BrightData (SSE transport)...")
    try:
        client = get_mcp_client(use_brightdata=True, transport="sse")
        print("✓ Client created successfully")
    except Exception as e:
        print(f"❌ Error creating client: {e}")
        return

    print("Getting tools from client...")
    try:
        tools = await asyncio.wait_for(client.get_tools(), timeout=30.0)
        print(f"✓ Successfully got {len(tools)} tools")
        print(f"Tool names: {[t.name for t in tools]}")
    except asyncio.TimeoutError:
        print("❌ Timeout getting tools after 30 seconds")
    except Exception as e:
        print(f"❌ Error getting tools: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

    # Also test with streamable_http
    print("\n" + "="*60)
    print("Testing with MCP Client (BrightData with streamable_http)")
    print("="*60)

    print("Creating MCP client with BrightData (streamable_http transport)...")
    try:
        client = get_mcp_client(use_brightdata=True, transport="streamable_http")
        print("✓ Client created successfully")
    except Exception as e:
        print(f"❌ Error creating client: {e}")
        return

    print("Getting tools from client...")
    try:
        tools = await asyncio.wait_for(client.get_tools(), timeout=30.0)
        print(f"✓ Successfully got {len(tools)} tools")
        print(f"Tool names: {[t.name for t in tools]}")
    except asyncio.TimeoutError:
        print("❌ Timeout getting tools after 30 seconds")
    except Exception as e:
        print(f"❌ Error getting tools: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("BrightData Connection Test")
    print("="*60)

    asyncio.run(test_brightdata_endpoint())
    asyncio.run(test_with_mcp_client())
