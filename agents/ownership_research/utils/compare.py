"""Compare multiple agent implementations."""
import time
import json
from typing import Any
from ownership_research.agents import get_agent, list_agents


async def compare_agents(
    description: str,
    agents: list[str] | None = None
) -> dict[str, Any]:
    """
    Run and compare multiple agents on same input.

    Args:
        description: Public asset description to research
        agents: List of agent names to compare (default: all registered agents)

    Returns:
        Comparison report with metrics
    """
    if agents is None:
        agents = list_agents()

    print(f"\n{'='*80}")
    print(f"COMPARING AGENTS")
    print(f"{'='*80}")
    print(f"Description: {description}\n")

    results = {}

    for agent_name in agents:
        print(f"🔵 Running {agent_name}...")
        agent_runner = get_agent(agent_name)

        start = time.time()
        try:
            result = await agent_runner.run(description)
            elapsed = time.time() - start

            results[agent_name] = {
                "result": result,
                "execution_time": round(elapsed, 2),
                "success": result and "error" not in result
            }

            status = "✅" if results[agent_name]["success"] else "❌"
            print(f"   {status} Completed in {elapsed:.2f}s\n")
        except Exception as e:
            elapsed = time.time() - start
            results[agent_name] = {
                "result": {"error": "EXECUTION_ERROR", "reason": str(e)},
                "execution_time": round(elapsed, 2),
                "success": False
            }
            print(f"   ❌ Failed after {elapsed:.2f}s: {e}\n")

    # Generate comparison metrics
    successful_results = {name: r for name, r in results.items() if r["success"]}

    comparison = {
        "description": description,
        "agents": results,
        "summary": {
            "all_succeeded": all(r["success"] for r in results.values()),
            "num_succeeded": len(successful_results),
            "num_failed": len(results) - len(successful_results),
            "fastest": min(results.items(), key=lambda x: x[1]["execution_time"])[0] if results else None,
        }
    }

    # Print summary
    print(f"{'='*80}")
    print("COMPARISON SUMMARY")
    print(f"{'='*80}")
    for agent_name, agent_result in results.items():
        status = "✅" if agent_result["success"] else "❌"
        print(f"{agent_name:15} {status}  {agent_result['execution_time']:6.2f}s")
    print(f"\nFastest: {comparison['summary']['fastest']}")
    print(f"All succeeded: {comparison['summary']['all_succeeded']}")
    print(f"{'='*80}\n")

    return comparison
