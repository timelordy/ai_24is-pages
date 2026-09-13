"""Считает простые метрики для ручного LLM-benchmark без API."""
import json
import sys
from pathlib import Path

FIELDS = ("title", "status", "due")
ROOT = Path(__file__).resolve().parent


def load(path):
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, list):
        raise ValueError("Ответ должен быть JSON-массивом")
    return value


def score(actual, cases):
    gold = {row["case"]: row["gold"] for row in cases}
    by_case = {}
    invalid = 0
    for row in actual:
        if not isinstance(row, dict) or not isinstance(row.get("case"), str):
            invalid += 1
            continue
        by_case[row["case"]] = row

    correct = 0
    hallucinated = 0
    total = len(gold) * len(FIELDS)
    details = []
    for case, expected in gold.items():
        row = by_case.get(case, {})
        errors = []
        for field in FIELDS:
            value = row.get(field, "<missing>")
            if value == expected[field]:
                correct += 1
            else:
                errors.append(f"{field}: {value!r} != {expected[field]!r}")
            if expected[field] is None and value not in (None, "<missing>"):
                hallucinated += 1
        details.append((case, errors))
    return correct, total, hallucinated, invalid, details


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Использование: python score_benchmark.py runs/baseline.json")
    cases = load(ROOT / "benchmark.json")
    actual = load(Path(sys.argv[1]))
    correct, total, hallucinated, invalid, details = score(actual, cases)
    print(f"field_accuracy={correct}/{total} ({correct / total:.1%})")
    print(f"hallucinated_values={hallucinated}")
    print(f"invalid_rows={invalid}; missing_cases={len(cases) - len({r.get('case') for r in actual if isinstance(r, dict)})}")
    for case, errors in details:
        print(case, "PASS" if not errors else " | ".join(errors))


if __name__ == "__main__":
    main()
