import os

search_paths = [
    os.path.expanduser("~/Library/Application Support/Cursor/User/History"),
    os.path.expanduser("~/Library/Application Support/Code/User/History")
]

best_file = None
best_time = 0

for history_path in search_paths:
    if not os.path.exists(history_path): continue
    print(f"Searching in {history_path}")
    for root, dirs, files in os.walk(history_path):
        for f in files:
            if f == "entries.json": continue
            filepath = os.path.join(root, f)
            try:
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if 'export const brands: Brand[] = [' in content:
                        # Ensure it's not the corrupted one
                        if '{ id: "alfa-romeo", name: "Alfa Romeo", slug: "alfa-romeo" },' in content:
                            mtime = os.path.getmtime(filepath)
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
    print("RESTORED VEHICLE-DATA.TS FROM HISTORY!")
else:
    print("Could not find a valid history file.")
