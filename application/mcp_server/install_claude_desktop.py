#!/usr/bin/env python3
"""
Python Installer for ManakAI MCP Server on Claude Desktop.
Safely updates %APPDATA%/Claude/claude_desktop_config.json on Windows,
preserving any existing MCP servers and adding 'manakai-standards'.
"""

import os
import sys
import json
from pathlib import Path

def install():
    print("=================================================================")
    print("ManakAI Model Context Protocol (MCP) - Claude Desktop Installer")
    print("=================================================================")

    # Determine paths
    appdata = os.environ.get("APPDATA")
    if not appdata:
        appdata = str(Path.home() / "AppData" / "Roaming")

    claude_dir = Path(appdata) / "Claude"
    config_file = claude_dir / "claude_desktop_config.json"

    project_root = Path(__file__).resolve().parent.parent.parent
    venv_python = project_root / ".venv" / "Scripts" / "python.exe"

    if venv_python.exists():
        python_cmd = str(venv_python)
    else:
        python_cmd = sys.executable

    bridge_script = str(project_root / "application" / "mcp_server" / "claude_desktop_bridge.py")

    claude_dir.mkdir(parents=True, exist_ok=True)

    config_data = {"mcpServers": {}}

    if config_file.exists():
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    existing = json.loads(content)
                    if isinstance(existing, dict) and "mcpServers" in existing:
                        config_data["mcpServers"] = existing["mcpServers"]
            print(f"[INFO] Loaded existing configuration from: {config_file}")
        except Exception as e:
            backup_file = config_file.with_suffix(".json.bak")
            print(f"[WARNING] Could not parse existing config ({e}). Backing up to {backup_file}")
            try:
                import shutil
                shutil.copy2(config_file, backup_file)
            except Exception:
                pass

    # Determine target backend URL (Render or local)
    target_url = "http://127.0.0.1:8000"
    if len(sys.argv) > 1 and sys.argv[1].startswith("http"):
        target_url = sys.argv[1].strip().rstrip("/")
    elif os.environ.get("MANAKAI_RENDER_URL"):
        target_url = os.environ.get("MANAKAI_RENDER_URL").strip().rstrip("/")
    elif os.environ.get("MANAKAI_BASE_URL"):
        target_url = os.environ.get("MANAKAI_BASE_URL").strip().rstrip("/")

    # Add or update manakai-standards
    config_data["mcpServers"]["manakai-standards"] = {
        "command": python_cmd,
        "args": [bridge_script],
        "env": {
            "MANAKAI_BASE_URL": target_url
        }
    }

    with open(config_file, "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=2)

    print(f"\n[SUCCESS] ManakAI MCP Server successfully configured in Claude Desktop!")
    print(f"Target Backend: {target_url}")
    print(f"Configuration written to: {config_file}")
    print("\nRegistered Tools:")
    print("  1. manakai_search_standards")
    print("  2. manakai_get_standard_details")
    print("  3. manakai_check_supersession_history")
    print("  4. manakai_get_normative_relations")
    print("  5. manakai_check_qco_compliance")
    print("  6. manakai_generate_nit_clause")
    print("\nTo switch to Render Cloud Hosting:")
    print(f"  Change 'MANAKAI_BASE_URL' in {config_file}")
    print("  from 'http://127.0.0.1:8000' to 'https://your-service.onrender.com'")
    print("\nPlease restart Claude Desktop now to load the tools!")

if __name__ == "__main__":
    install()
