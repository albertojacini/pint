"""Test the full entity information agent workflow."""

import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

from main import EntityInformationAgent


async def test_agent():
    """Test the entity agent with a small Italian city."""
    print("="*70)
    print("🤖 Testing Entity Information Agent")
    print("="*70)

    # Create agent
    print("\n1️⃣  Initializing agent...")
    agent = EntityInformationAgent()
    print("✅ Agent initialized")

    # Test with Ferrara (smaller city to avoid rate limits)
    print("\n2️⃣  Processing entity: Ferrara, Italy")
    print("="*70)

    result = await agent.process_entity(
        entity_name="Ferrara",
        entity_type="city",
        language="it"
    )

    print("\n" + "="*70)
    print("📊 Results Summary")
    print("="*70)

    if result.get("complete_entity"):
        entity = result["complete_entity"]
        print(f"\n✅ Entity processed successfully!")
        print(f"\n📝 Entity Details:")
        print(f"   Name: {entity.name}")
        print(f"   Type: {entity.type}")

        if entity.population:
            print(f"   Population: {entity.population:,}")

        if entity.description:
            desc = entity.description
            print(f"   Description: {desc[:150]}..." if len(desc) > 150 else f"   Description: {desc}")

        if entity.identity_data:
            if entity.identity_data.official_website:
                print(f"   Official Website: {entity.identity_data.official_website}")
            if entity.identity_data.country:
                print(f"   Country: {entity.identity_data.country}")

        if entity.political_landscape and entity.political_landscape.current_mayor:
            mayor = entity.political_landscape.current_mayor
            print(f"\n👤 Current Mayor:")
            print(f"   Name: {mayor.name}")
            if mayor.party:
                print(f"   Party: {mayor.party}")
            if mayor.term_start:
                print(f"   Term Start: {mayor.term_start}")

        if result.get("db_result"):
            db = result["db_result"]
            print(f"\n💾 Database:")
            print(f"   Operation: {db.get('operation')}")
            print(f"   Entity ID: {db.get('entity_id')}")

        print("\n" + "="*70)
        print("✅ Agent test completed successfully!")
        print("="*70)
        return True

    else:
        print("\n⚠️  Processing completed with issues")
        if result.get("errors"):
            print(f"   Errors:")
            for error in result.get("errors", []):
                print(f"     - {error}")
        print("="*70)
        return False


if __name__ == "__main__":
    success = asyncio.run(test_agent())
    exit(0 if success else 1)
