import re

with open("src/lib/vehicle-data.ts", "r") as f:
    lines = f.readlines()

out = []
in_brands = False
for line in lines:
    if "export const brands: Brand[] = [" in line:
        in_brands = True
        out.append(line)
        continue
    if in_brands and "];" in line:
        in_brands = False
        out.append(line)
        continue
        
    if in_brands and line.strip().startswith("{ id:"):
        # The line looks like:
        # { id: "alfa-romeo", name: "Alfa Romeo\"alfa-romeo\", name: \"Alfa Romeo\", slug: \"alfa-romeo\", logo: \"/brands/alfa-romeo.svg?v=14" },
        # We can reconstruct it easily.
        # Everything from `\"` onwards is the actual string from `id` onwards, escaped.
        # Let's find `\"`
        idx = line.find('\\"')
        if idx != -1:
            # The corrupted tail is: alfa-romeo\", name: \"Alfa Romeo\", slug: \"alfa-romeo\", logo: \"/brands/alfa-romeo.svg?v=14" },
            # If we unescape it:
            tail = line[idx+2:]
            tail = tail.replace('\\"', '"')
            # It becomes: alfa-romeo", name: "Alfa Romeo", slug: "alfa-romeo", logo: "/brands/alfa-romeo.svg?v=14" },
            # Wait, the `id: "` part is missing.
            clean_line = '    { id: "' + tail
            # Actually, sometimes `scale:` is also there.
            out.append(clean_line)
        else:
            out.append(line)
    else:
        out.append(line)

with open("src/lib/vehicle-data.ts", "w") as f:
    f.writelines(out)

print("Brands fixed.")
