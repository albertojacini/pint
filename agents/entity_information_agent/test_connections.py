"""Test suite for verifying all connections and integrations."""

import os
import asyncio
import sys
from typing import Dict, Any
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


class ConnectionTester:
    """Test all connections required by the entity information agent."""

    def __init__(self):
        self.results = {}
        self.all_passed = True

    def print_header(self, title: str):
        """Print a formatted header."""
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")

    def print_result(self, test_name: str, success: bool, details: str = ""):
        """Print test result with formatting."""
        icon = "✅" if success else "❌"
        status = "PASSED" if success else "FAILED"
        print(f"{icon} {test_name}: {status}")
        if details:
            print(f"   {details}")
        self.results[test_name] = success
        if not success:
            self.all_passed = False

    def test_environment_variables(self) -> bool:
        """Test that all required environment variables are set."""
        self.print_header("Testing Environment Variables")

        required_vars = {
            "DATABASE_URL": "PostgreSQL connection string",
            "OPENAI_API_KEY": "OpenAI API key for LLM",
            "BRIGHTDATA_API_KEY": "BrightData API key for SERP",
            # Optional MCP variables
            "API_TOKEN": "BrightData MCP API token (optional)",
            "BROWSER_AUTH": "BrightData browser auth (optional)",
            "WEB_UNLOCKER_ZONE": "BrightData web unlocker zone (optional)"
        }

        all_present = True
        for var, description in required_vars.items():
            value = os.getenv(var)
            is_optional = "optional" in description

            if value:
                self.print_result(
                    f"{var}",
                    True,
                    f"Set ({description})"
                )
            elif is_optional:
                self.print_result(
                    f"{var}",
                    True,
                    f"Not set ({description})"
                )
            else:
                self.print_result(
                    f"{var}",
                    False,
                    f"Missing! ({description})"
                )
                all_present = False

        return all_present

    def test_database_connection(self) -> bool:
        """Test PostgreSQL database connection."""
        self.print_header("Testing Database Connection")

        try:
            from db_operations import test_connection, list_entities

            # Test basic connection
            connected = test_connection()
            self.print_result(
                "Database Connection",
                connected,
                "Connected to PostgreSQL" if connected else "Failed to connect"
            )

            if connected:
                # Try to list entities
                entities = list_entities(limit=5)
                self.print_result(
                    "Query Execution",
                    True,
                    f"Found {len(entities)} existing entities"
                )
                return True
            return False

        except Exception as e:
            self.print_result(
                "Database Connection",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_wikipedia_api(self) -> bool:
        """Test Wikipedia API access."""
        self.print_header("Testing Wikipedia API")

        try:
            from web_operations import get_wikipedia_content

            # Test with a known page
            content = get_wikipedia_content("Roma", language="it")

            if content and content.get("extract"):
                self.print_result(
                    "Wikipedia API",
                    True,
                    f"Successfully fetched content (length: {len(content['extract'])} chars)"
                )

                # Check for expected fields
                has_url = bool(content.get("url"))
                has_title = bool(content.get("title"))

                self.print_result(
                    "Wikipedia Response Structure",
                    has_url and has_title,
                    f"URL: {has_url}, Title: {has_title}"
                )
                return True
            else:
                self.print_result(
                    "Wikipedia API",
                    False,
                    "No content returned"
                )
                return False

        except Exception as e:
            self.print_result(
                "Wikipedia API",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_brightdata_serp(self) -> bool:
        """Test BrightData SERP API."""
        self.print_header("Testing BrightData SERP API")

        try:
            from web_operations import get_serp_results

            # Test with a simple query
            results = get_serp_results("Bologna comune Italia", num_results=5)

            if results:
                self.print_result(
                    "BrightData SERP API",
                    True,
                    f"Successfully fetched {len(results)} results"
                )

                # Check for Wikipedia results
                wikipedia_results = [r for r in results if r.is_wikipedia]
                self.print_result(
                    "Wikipedia Detection",
                    len(wikipedia_results) > 0,
                    f"Found {len(wikipedia_results)} Wikipedia results"
                )
                return True
            else:
                self.print_result(
                    "BrightData SERP API",
                    False,
                    "No results returned (check API key)"
                )
                return False

        except Exception as e:
            self.print_result(
                "BrightData SERP API",
                False,
                f"Error: {str(e)}"
            )
            return False

    async def test_mcp_tools(self) -> bool:
        """Test BrightData MCP tools (optional)."""
        self.print_header("Testing BrightData MCP Tools (Optional)")

        # Check if MCP environment variables are set
        if not all([os.getenv("API_TOKEN"), os.getenv("BROWSER_AUTH"), os.getenv("WEB_UNLOCKER_ZONE")]):
            self.print_result(
                "MCP Tools",
                True,
                "Skipped (MCP environment variables not set)"
            )
            return True

        try:
            from mcp_operations import initialize_mcp_session, close_mcp_session

            # Try to initialize MCP session
            tools = await initialize_mcp_session()

            if tools:
                self.print_result(
                    "MCP Session",
                    True,
                    f"Successfully initialized ({len(tools)} tools available)"
                )

                # Close session
                await close_mcp_session()
                self.print_result(
                    "MCP Cleanup",
                    True,
                    "Session closed successfully"
                )
                return True
            else:
                self.print_result(
                    "MCP Session",
                    False,
                    "Failed to initialize session"
                )
                return False

        except Exception as e:
            self.print_result(
                "MCP Tools",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_llm_connection(self) -> bool:
        """Test LLM (OpenAI) connection."""
        self.print_header("Testing LLM Connection")

        try:
            from langchain_openai import ChatOpenAI

            # Check if API key is available
            openai_key = os.getenv("OPENAI_API_KEY")

            if not openai_key:
                self.print_result(
                    "OpenAI LLM",
                    False,
                    "OPENAI_API_KEY not found in environment"
                )
                return False

            # Test OpenAI
            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0,
                max_tokens=100
            )
            response = llm.invoke("Say 'connection test successful' and nothing else.")

            self.print_result(
                "OpenAI LLM",
                True,
                f"Connected (Response: {response.content[:50]}...)"
            )
            return True

        except Exception as e:
            self.print_result(
                "OpenAI LLM",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_official_website_search(self) -> bool:
        """Test official website search functionality."""
        self.print_header("Testing Official Website Search")

        try:
            from web_operations import search_official_website

            # Test with a known entity
            url = search_official_website(
                entity_name="Bologna",
                entity_type="comune",
                country="italia"
            )

            if url:
                self.print_result(
                    "Official Website Search",
                    True,
                    f"Found: {url}"
                )
                return True
            else:
                self.print_result(
                    "Official Website Search",
                    False,
                    "No official website found (may be normal)"
                )
                return False

        except Exception as e:
            self.print_result(
                "Official Website Search",
                False,
                f"Error: {str(e)}"
            )
            return False

    async def run_all_tests(self):
        """Run all connection tests."""
        print("\n" + "="*60)
        print("  ENTITY INFORMATION AGENT - CONNECTION TEST SUITE")
        print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        print("="*60)

        # Run tests in order of importance
        tests = [
            ("Environment Variables", self.test_environment_variables),
            ("Database", self.test_database_connection),
            ("LLM", self.test_llm_connection),
            ("Wikipedia API", self.test_wikipedia_api),
            ("BrightData SERP", self.test_brightdata_serp),
            ("Official Website Search", self.test_official_website_search),
        ]

        for name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.print_result(name, False, f"Unexpected error: {str(e)}")

        # Run async tests
        try:
            await self.test_mcp_tools()
        except Exception as e:
            self.print_result("MCP Tools", False, f"Unexpected error: {str(e)}")

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary."""
        self.print_header("TEST SUMMARY")

        passed = sum(1 for v in self.results.values() if v)
        total = len(self.results)
        percentage = (passed / total * 100) if total > 0 else 0

        print(f"\nTests Passed: {passed}/{total} ({percentage:.1f}%)")

        if self.all_passed:
            print("\n🎉 ALL TESTS PASSED! The agent is ready to run.")
        else:
            print("\n⚠️ SOME TESTS FAILED. Please check the issues above.")
            print("\nFailed tests:")
            for test, result in self.results.items():
                if not result:
                    print(f"  - {test}")

        print("\n" + "="*60)


async def main():
    """Main function to run all tests."""
    tester = ConnectionTester()
    await tester.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())