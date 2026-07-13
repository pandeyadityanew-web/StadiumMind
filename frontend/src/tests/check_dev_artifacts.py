import os

page_path = r"C:\Users\pande\.gemini\antigravity\scratch\stadiummind-ai\frontend\src\app\dashboard\page.tsx"

print(f"Checking dev artifacts in: {page_path}")
if os.path.exists(page_path):
    with open(page_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    found = False
    for idx, line in enumerate(lines):
        line_num = idx + 1
        lower_line = line.lower()
        if "console.log" in lower_line:
            print(f"[{line_num}] console.log: {line.strip()}")
            found = True
        if "todo" in lower_line:
            print(f"[{line_num}] TODO: {line.strip()}")
            found = True
        if "fixme" in lower_line:
            print(f"[{line_num}] FIXME: {line.strip()}")
            found = True
    if not found:
        print("No debug logs, TODOs, or FIXMEs found.")
else:
    print(f"Could not find page.tsx at {page_path}")
