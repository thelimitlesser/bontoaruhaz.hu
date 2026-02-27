
import os
import xml.etree.ElementTree as ET
import re

brands_dir = os.path.join(os.getcwd(), 'public/brands')
ET.register_namespace('', "http://www.w3.org/2000/svg")

def filter_svg(filename, min_len=0, keep_indices=None):
    path = os.path.join(brands_dir, filename)
    if not os.path.exists(path): return

    try:
        tree = ET.parse(path)
        root = tree.getroot()
        
        # Collect paths
        paths = []
        for elem in root.iter('{http://www.w3.org/2000/svg}path'):
            paths.append(elem)
            
        # Clear root text/tail to be clean
        # Remove all paths from root (we will re-add kept ones? No, tricky if nested).
        # Better: iterate and remove from parent.
        # But ElementTree doesn't support parent pointer.
        # So we iterate parent (root) and remove children.
        
        # Simpler: Create NEW root.
        new_root = ET.Element('svg', root.attrib)
        
        # Add preserved paths
        count = 0
        for i, p in enumerate(paths):
            d = p.attrib.get('d', '')
            length = len(d)
            keep = False
            
            if keep_indices and i in keep_indices: keep = True
            elif min_len > 0 and length >= min_len: keep = True
            
            if keep:
                new_root.append(p)
                count += 1
                
        tree = ET.ElementTree(new_root)
        tree.write(path)
        print(f"Filtered {filename}: Kept {count} paths.")
        
    except Exception as e:
        print(f"Error filtering {filename}: {e}")

def split_and_filter_subpaths(filename):
    # For Lexus: Split 'd' string into subpaths (M...z)
    path_file = os.path.join(brands_dir, filename)
    if not os.path.exists(path_file): return
    
    try:
        tree = ET.parse(path_file)
        root = tree.getroot()
        
        # Assume single path
        main_path = root.find('{http://www.w3.org/2000/svg}path')
        if main_path is None: return
        
        d = main_path.attrib.get('d', '')
        # Split by 'z' or 'Z'
        # Regex to split but keep delimiter?
        # Actually, standard SVG 'd' parser is complex.
        # But typically: M ... z M ... z
        
        subpaths = re.split(r'(?i)(z\s*M)', d) 
        # This split is messy.
        # Better: Find all "M" commands.
        # If we use regex `[mM][^mM]*[zZ]`
        
        parts = re.findall(r'([mM][^zZ]*[zZ])', d)
        
        if not parts:
            parts = [d] # No Z?
            
        print(f"Lexus: Found {len(parts)} sub-paths.")
        
        # We want to keep the "Icon" part.
        # Heuristic: The icon path string is usually *longer* (more curves) than text letters.
        # Or bounding box logic.
        
        longest_part = ""
        max_len = 0
        for p in parts:
            if len(p) > max_len:
                max_len = len(p)
                longest_part = p
        
        # Apply only the longest part
        main_path.attrib['d'] = longest_part
        tree.write(path_file)
        print(f"Filtered Lexus to longest sub-path ({max_len} chars).")
        
    except Exception as e:
        print(f"Error filtering Lexus: {e}")

# Apply Logic
# Alfa: > 1000
filter_svg('alfa.svg', min_len=1000)
# Saab: > 1000
filter_svg('saab.svg', min_len=1000)
# Daewoo: > 1000
filter_svg('daewoo.svg', min_len=1000)
# Lancia: > 500
filter_svg('lancia.svg', min_len=500)
# Subaru: > 500
filter_svg('subaru.svg', min_len=500)

# Volvo: Manual inspection showed lengths 255, 245, 239...
# If text is V O L V O (5 letters).
# Iron mark is Circle + Arrow.
# If SVGs are letters + mark.
# I will try to keep the top 2 paths?
# Logic: use `keep_indices`.
# Based on `inspect_paths.py`: Path 3 (255), Path 2 (245), Path 1 (239).
# Maybe these are the circle/arrow?
# I'll keep top 2.
# Wait, list was sorted.
# Indices were 3, 2, 1, 4, 0.
# I'll keep indices [3, 2, 1] (Top 3).
filter_svg('volvo.svg', keep_indices=[3, 2, 1])

# Lexus: Split subpaths
split_and_filter_subpaths('lexus.svg')

