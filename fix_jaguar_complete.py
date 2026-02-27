import re

with open("public/brands/jaguar.svg", "r") as f:
    svg = f.read()

m = re.search(r'd="([^"]+)"', svg)
d = m.group(1)

# Split into all disconnected M-segments
segments = re.split(r'(?=[Mm])', d)
segments = [s.strip() for s in segments if s.strip()]

# Take everything up to segment 8 (the 9th segment is index 8)
# Wait, based on my previous analysis:
# Index 0 was empty.
# Index 1 to 8 were the cat.
# Index 9 was the wordmark.
# So segments[0:8] if index 0 is the first one.

# Let's be safer and use the lengths I saw.
# The list from my print was:
# Index 1: 1290
# Index 2: 284
# Index 3: 2423
# Index 4: 115
# Index 5: 137
# Index 6: 106
# Index 7: 124
# Index 8: 98
# Index 9: 143 (Wordmark start)

# So indices 0 to 7 in the segments list (if Index 0 was empty).
# Actually, the re.split output has Index 0 as empty.
# So:
# segments[0] = ""
# segments[1] = Index 1
# ...
# segments[8] = Index 8
# segments[9] = Index 9 (Wordmark)

# So we take segments[1:9]
cat_segments = segments[1:9]
cat_d = "".join(cat_segments)

# ViewBox analysis:
# Cat starts at y=6.6
# Wordmark starts at relative y=+7.4 (approx 14)
# So the cat is roughly in y=[6, 14]
# x is roughly [3, 22]

new_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 6 22 8" width="100%" height="100%">
  <path fill="white" d="{cat_d}"/>
</svg>'''

with open("public/brands/jaguar-brand-final-v4.svg", "w") as f:
    f.write(new_svg)

print(f"Created full-complete jaguar from {len(cat_segments)} segments.")
