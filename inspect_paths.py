
import os
import xml.etree.ElementTree as ET
import re

brands = ['alfa.svg', 'saab.svg', 'lancia.svg', 'subaru.svg', 'volvo.svg', 'daewoo.svg', 'lexus.svg']
brands_dir = os.path.join(os.getcwd(), 'public/brands')

ET.register_namespace('', "http://www.w3.org/2000/svg")

def get_path_bbox(d_str):
    # Very crude bbox of 'd' string
    # Parse all numbers
    if not d_str: return None
    nums = [float(x) for x in re.findall(r'-?\d*\.?\d+', d_str)]
    if not nums: return None
    # x coords are at even indices, y at odd
    # But svg commands are complex (M x y, c dx dy...).
    # If absolute, this works. If relative, it fails.
    # Assuming standard SVGs often use absolute for major shapes?
    # Actually, many use relative.
    # This heuristic is weak.
    
    # Better: Count length of string? 
    # Icon paths are usually LONG (many points). Text letters are SHORT.
    return len(d_str)

for b in brands:
    p = os.path.join(brands_dir, b)
    if not os.path.exists(p): continue
    
    try:
        tree = ET.parse(p)
        root = tree.getroot()
        path_lens = []
        for i, elem in enumerate(root.iter('{http://www.w3.org/2000/svg}path')):
            d = elem.attrib.get('d', '')
            length = len(d)
            if length > 0:
                path_lens.append((i, length))
        
        print(f"--- {b} ---")
        # Sort by length descending
        path_lens.sort(key=lambda x: x[1], reverse=True)
        for i, l in path_lens:
            print(f"  Path {i}: len={l}")
            
    except Exception as e:
        print(f"Error {b}: {e}")
