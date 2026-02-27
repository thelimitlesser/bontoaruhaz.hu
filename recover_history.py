import os
import glob
import re

history_path = os.path.expanduser("~/Library/Application Support/Code/User/History")

best_file = None
best_time = 0

print(f"Searching in {history_path}")

for root, dirs, files in os.walk(history_path):
    for f in files:
        if f == "entries.json": continue
        filepath = os.path.join(root, f)
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                # Must be our file: contains standard brands and hasn't been corrupted
                if 'export const brands: Brand[] = [' in content:
                    # Check if it has the original uncorrupted Alfa Romeo brand
                    if '{ id: "alfa-romeo", name: "Alfa Romeo", slug: "alfa-romeo" },' in content:
                        mtime = os.path.getmtime(filepath)
                        # We want the most recent one that is still uncorrupted
                        if mtime > best_time:
                            best_time = mtime
                            best_file = filepath
                            print(f"Found good candidate: {filepath} at {mtime}")
        except Exception:
            pass

if best_file:
    print(f"Best file found: {best_file}")
    with open(best_file, 'r') as f:
        good_content = f.read()
    with open("src/lib/vehicle-data.ts", "w") as f:
        f.write(good_content)
    print("RESTORED VEHICLE-DATA.TS FROM VS CODE HISTORY!")
else:
    print("Could not find a valid history file.")
