import argparse
import shutil
import sys
import subprocess

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument("--teacher", action="store_true")
    args = parser.parse_args()
    good = sys.version_info >= (3, 11)
    print("Python >=3.11:", "OK" if good else "FAIL")
    print("Python path:", sys.executable)
    for name in ("git", "opencode", "node"):
        print(name + ":", "found" if shutil.which(name) else "optional / not found")
    print("Проверка не подтверждает доступ модели. Выполните живой tool call по pilot-checklist.md.")
    if args.teacher:
        result = subprocess.run([sys.executable, "scripts/check_course.py"], check=False)
        good = good and result.returncode == 0
    return 0 if good else 1

if __name__ == "__main__":
    raise SystemExit(main())
