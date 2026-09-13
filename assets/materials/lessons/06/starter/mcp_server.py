"""Минимальный MCP stdio: initialize, ping, tools/list, tools/call.
Учебная реализация протокола 2024-11-05; без сети и сторонних пакетов.
"""
import json
import sys
from tasks import load_tasks, select_tasks, get_task

TOOLS = [
    {"name": "list_tasks", "description": "Read tasks, optionally filter todo/done.",
     "inputSchema": {"type": "object", "properties": {"status": {"type": "string", "enum": ["todo", "done"]}}, "additionalProperties": False},
     "annotations": {"readOnlyHint": True, "destructiveHint": False}},
    {"name": "get_task", "description": "Read one task by positive integer id.",
     "inputSchema": {"type": "object", "properties": {"id": {"type": "integer", "minimum": 1}}, "required": ["id"], "additionalProperties": False},
     "annotations": {"readOnlyHint": True, "destructiveHint": False}},
]

def call_tool(name, args):
    if not isinstance(args, dict):
        raise ValueError("INVALID_ARGUMENTS")
    if name == "list_tasks":
        if set(args) - {"status"} or ("status" in args and args["status"] not in ("todo", "done")):
            raise ValueError("INVALID_ARGUMENTS")
        return select_tasks(load_tasks(), args.get("status"))
    if name == "get_task":
        if set(args) != {"id"}:
            raise ValueError("INVALID_ARGUMENTS")
        return get_task(load_tasks(), args["id"])
    raise ValueError("UNKNOWN_TOOL")

def dispatch(request):
    if not isinstance(request, dict) or request.get("jsonrpc") != "2.0" or not isinstance(request.get("method"), str):
        return {"jsonrpc": "2.0", "id": None, "error": {"code": -32600, "message": "Invalid Request"}}
    if "id" not in request:
        return None
    response = {"jsonrpc": "2.0", "id": request["id"]}
    method = request["method"]
    if method == "initialize":
        result = {"protocolVersion": "2024-11-05", "capabilities": {"tools": {"listChanged": False}},
                  "serverInfo": {"name": "course-tasks", "version": "1.0.0"}}
    elif method == "ping":
        result = {}
    elif method == "tools/list":
        result = {"tools": TOOLS}
    elif method == "tools/call":
        params = request.get("params", {})
        if not isinstance(params, dict):
            return dict(response, error={"code": -32602, "message": "Invalid params"})
        try:
            value = call_tool(params.get("name"), params.get("arguments", {}))
            result = {"content": [{"type": "text", "text": json.dumps(value, ensure_ascii=False)}], "isError": False}
        except (ValueError, LookupError, OSError, TypeError):
            result = {"content": [{"type": "text", "text": "TOOL_ERROR: invalid input, missing task or unreadable data. Check arguments and local data."}], "isError": True}
    else:
        return dict(response, error={"code": -32601, "message": "Method not found"})
    return dict(response, result=result)

def main():
    while True:
        line = sys.stdin.buffer.readline(100_001)
        if not line:
            return
        if len(line) > 100_000:
            return  # bounded input; connection is closed on oversized messages
        try:
            response = dispatch(json.loads(line))
        except (ValueError, UnicodeError):
            response = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}}
        if response is not None:
            print(json.dumps(response, ensure_ascii=True), flush=True)

if __name__ == "__main__":
    main()
