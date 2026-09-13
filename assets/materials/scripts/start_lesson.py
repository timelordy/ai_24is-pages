"""Создать новую независимую рабочую папку, не затирая предыдущую."""
from pathlib import Path
import argparse
import shutil
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument("lesson", choices=[f"{n:02}" for n in range(1, 8)])
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1] / "lessons" / args.lesson / "starter"
    if args.destination.exists():
        parser.error("Папка уже существует. Укажите новую: старые работы не перезаписываются.")
    shutil.copytree(source, args.destination)
    print(f"Готово: {args.destination.resolve()}. Перейдите в неё; прочитайте START.md.")

if __name__ == "__main__":
    main()
