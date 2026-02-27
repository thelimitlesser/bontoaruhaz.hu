import urllib.request
versions = ['v5.5.0', 'v6.0.0', 'v8.0.0', 'v9.0.0', 'v10.0.0', 'v11.0.0', 'v12.0.0']

for v in versions:
    url = f"https://cdn.jsdelivr.net/npm/simple-icons@{v[1:]}/icons/alfaromeo.svg"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as r:
            content = r.read().decode()
            if "<svg" in content:
                print("Found in", v)
                with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
                    f.write(content.replace('currentColor', 'white').replace('<svg', '<svg fill="white" width="100%" height="100%"'))
                print("Successfully saved Alfa vector!")
                break
    except Exception as e:
        print(f"Failed {v}: {e}")
