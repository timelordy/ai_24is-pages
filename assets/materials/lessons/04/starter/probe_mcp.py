"""Настоящий обмен JSON-RPC с дочерним MCP, без модели и зависимостей."""
import json
from pathlib import Path
import subprocess
import sys

def main():
    requests = [
        {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"course-probe","version":"1"}}},
        {"jsonrpc":"2.0","method":"notifications/initialized"},
        {"jsonrpc":"2.0","id":2,"method":"tools/list"},
        {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_tasks","arguments":{"status":"todo"}}},
        {"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_task","arguments":{"id":999}}}]
    result = subprocess.run([sys.executable, str(Path(__file__).with_name("mcp_server.py"))],
        input="".join(json.dumps(r)+"\n" for r in requests), text=True, capture_output=True, timeout=10, check=True)
    responses = [json.loads(line) for line in result.stdout.splitlines()]
    assert len(responses) == 4
    assert {t["name"] for t in responses[1]["result"]["tools"]} == {"list_tasks", "get_task"}
    assert responses[2]["result"]["isError"] is False
    assert responses[3]["result"]["isError"] is True
    print("PASS: initialize, tools/list, list_tasks, unknown id; process exited")

if __name__ == "__main__":
    main()
