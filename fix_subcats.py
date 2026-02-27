with open("src/lib/vehicle-data.ts", "r") as f:
    text = f.read()

import re
# we need to replace the corrupted subcategories with the correct ones.
# Because the corrupted ones look like:
# { id: "subcat-body-exterior-1000", categoryId: "body-exterior", name: "AJTÓ\"subcat-body-exterior-1000\", categoryId: \"body-exterior\", name: \"AJTÓ\", slug: \"ajto\", productCount: 0 },
# Everything from `\"` to the end of the line is the unescaped original string.
# Let's fix it just like we did for brands!
lines = text.split("\n")
out = []
in_subcats = False
for line in lines:
    if "export const subcategories: Subcategory[] = [" in line:
        in_subcats = True
        out.append(line)
        continue
    if in_subcats and "];" in line:
        in_subcats = False
        out.append(line)
        continue
        
    if in_subcats and "categoryId:" in line:
        idx = line.find('\\"')
        if idx != -1:
            tail = line[idx+2:]
            tail = tail.replace('\\"', '"')
            clean_line = '    { id: "' + tail
            if clean_line.endswith("},"):
                out.append(clean_line)
            else:
                out.append(clean_line + "},")
            continue
    out.append(line)

with open("src/lib/vehicle-data.ts", "w") as f:
    f.write("\n".join(out))
    
print("Subcategories fixed.")
