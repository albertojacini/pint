"""Script to clearly display all MCP tool parameters."""

import asyncio
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.mcp_client import get_mcp_tools


async def main():
    """Display all MCP tools with clear parameter information."""

    try:
        tools = await get_mcp_tools()

        print("\n" + "=" * 100)
        print(f"FOUND {len(tools)} MCP TOOLS")
        print("=" * 100)

        for i, tool in enumerate(tools, 1):
            print(f"\n{'#' * 100}")
            print(f"TOOL #{i}: {tool.name}")
            print(f"{'#' * 100}")
            print(f"\nDescription:")
            print(f"  {tool.description}")

            # Get parameters from args attribute
            if hasattr(tool, 'args') and tool.args:
                print(f"\nParameters:")
                args = tool.args
                schema = tool.args_schema if hasattr(tool, 'args_schema') else {}

                required = schema.get('required', []) if isinstance(schema, dict) else []

                for param_name, param_info in args.items():
                    is_required = param_name in required
                    req_marker = "[REQUIRED]" if is_required else "[OPTIONAL]"

                    print(f"\n  • {param_name} {req_marker}")

                    param_type = param_info.get('type', 'unknown')
                    print(f"    Type: {param_type}")

                    if 'description' in param_info:
                        print(f"    Description: {param_info['description']}")

                    if 'enum' in param_info:
                        print(f"    Allowed values: {', '.join(param_info['enum'])}")

                    if 'default' in param_info:
                        print(f"    Default: {param_info['default']}")

                    # Show any other properties
                    other_props = {k: v for k, v in param_info.items()
                                 if k not in ['type', 'description', 'enum', 'default']}
                    if other_props:
                        print(f"    Other: {json.dumps(other_props, indent=6)}")

            else:
                print(f"\n  No parameters")

            print()

        # Create a quick reference table
        print("\n" + "=" * 100)
        print("QUICK REFERENCE")
        print("=" * 100)

        for tool in tools:
            print(f"\n{tool.name}:")
            if hasattr(tool, 'args') and tool.args:
                required = tool.args_schema.get('required', []) if isinstance(tool.args_schema, dict) else []
                params = []
                for param_name in tool.args.keys():
                    if param_name in required:
                        params.append(f"{param_name}*")
                    else:
                        params.append(param_name)
                print(f"  Parameters: {', '.join(params)}")
                print(f"  (* = required)")
            else:
                print(f"  No parameters")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
