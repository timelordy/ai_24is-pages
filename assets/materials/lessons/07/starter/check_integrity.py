import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
manifest = json.loads((root / "integrity.json").read_text(encoding="utf-8"))
for name, expected in manifest.items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == expected, name + " changed"
print("PASS: protected files unchanged against starter manifest")
