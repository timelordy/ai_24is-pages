"""Show current free tool-capable candidates from public provider catalogs."""

from __future__ import annotations

import json
from urllib.request import Request, urlopen


ZEN_URL = "https://opencode.ai/zen/v1/models"
OPENROUTER_URL = "https://openrouter.ai/api/v1/models"
PREFERRED_OPENROUTER = (
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "openrouter/free",
)
PREFERRED_ZEN = (
    "nemotron-3.5-lightning-free",
    "nemotron-3-ultra-free",
    "mimo-v2.5-free",
)


def load(url: str) -> list[dict]:
    request = Request(url, headers={"User-Agent": "ai-24is-course-check/1.0"})
    with urlopen(request, timeout=15) as response:
        return json.load(response)["data"]


def main() -> int:
    try:
        zen = {model["id"] for model in load(ZEN_URL)}
        openrouter = load(OPENROUTER_URL)
    except Exception as error:
        print(f"ERROR: catalog check failed: {error}")
        return 1

    free_tools = {
        model["id"]
        for model in openrouter
        if model.get("pricing", {}).get("prompt") == "0"
        and model.get("pricing", {}).get("completion") == "0"
        and "tools" in model.get("supported_parameters", [])
    }

    print("OpenRouter: free + tools")
    for model_id in PREFERRED_OPENROUTER:
        print(f"  {'OK' if model_id in free_tools else 'MISSING'}  {model_id}")

    print("Zen catalog (billing details are still required by Zen setup)")
    for model_id in PREFERRED_ZEN:
        print(f"  {'OK' if model_id in zen else 'MISSING'}  opencode/{model_id}")

    missing = [model_id for model_id in PREFERRED_OPENROUTER if model_id not in free_tools]
    if missing:
        print("NO-GO: a preferred OpenRouter route is missing; run the classroom pilot.")
        return 2
    print("CATALOG OK: availability from the classroom network still needs a real tool call.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
