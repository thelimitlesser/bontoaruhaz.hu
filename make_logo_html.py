import os

svg_dir = "/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands"
svg_files = [f for f in os.listdir(svg_dir) if f.endswith('.svg') and not '_' in f]

html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Logo Review Dashboard</title>
    <style>
        body { background-color: #111; color: #fff; font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
        .logo-card { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 140px; height: 180px; padding: 10px; border: 1px solid #333; border-radius: 8px; background: rgba(255,255,255,0.05); }
        .logo-container { width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; }
        img { max-width: 100px; max-height: 100px; filter: drop-shadow(0px 0px 8px rgba(255,255,255,0.8)); }
        .name { margin-top: 15px; font-size: 14px; text-align: center; word-break: break-all; font-weight: bold; }
    </style>
</head>
<body>
"""

for svg in sorted(svg_files):
    svg_path = os.path.join(svg_dir, svg)
    html_content += f"""
    <div class="logo-card">
        <div class="logo-container">
            <img src="file://{svg_path}" alt="{svg}">
        </div>
        <div class="name">{svg}</div>
    </div>
    """

html_content += """
</body>
</html>
"""

with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/all_logos.html", "w") as f:
    f.write(html_content)
print("Dashboard created at all_logos.html")
