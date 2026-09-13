"""Учебный список задач: стандартная библиотека Python 3.11+."""
import json
from datetime import date
from pathlib import Path

DATA = Path(__file__).with_name("tasks.json")

def load_tasks(path=DATA):
    if path.stat().st_size > 100_000:
        raise ValueError("DATA_TOO_LARGE")
    rows = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(rows, list) or len(rows) > 100:
        raise ValueError("INVALID_DATA")
    ids = set()
    for row in rows:
        if not isinstance(row, dict) or set(row) != {"id", "title", "status", "due"}:
            raise ValueError("INVALID_TASK")
        if type(row["id"]) is not int or row["id"] <= 0 or row["id"] in ids:
            raise ValueError("INVALID_ID")
        ids.add(row["id"])
        if not isinstance(row["title"], str) or not 1 <= len(row["title"]) <= 500:
            raise ValueError("INVALID_TITLE")
        if row["status"] not in ("todo", "done"):
            raise ValueError("INVALID_STATUS")
        due = row["due"]
        if due is not None:
            if not isinstance(due, str) or date.fromisoformat(due).isoformat() != due:
                raise ValueError("INVALID_DATE")
    return rows

def select_tasks(rows, status=None):
    if status not in (None, "todo", "done"):
        raise ValueError("INVALID_STATUS")
    return [dict(row) for row in rows if status is None or row["status"] == status]

def sort_tasks(rows):
    return sorted(rows, key=lambda row: (row["due"] is None, row["due"] or "", row["id"]))

def get_task(rows, task_id):
    if type(task_id) is not int or task_id <= 0:
        raise ValueError("INVALID_ID")
    for row in rows:
        if row["id"] == task_id:
            return dict(row)
    raise LookupError("NOT_FOUND")

if __name__ == "__main__":
    for task in sort_tasks(select_tasks(load_tasks(), "todo")):
        print(f"{task['id']}: {task['title']} | {task['due'] or 'без срока'}")
