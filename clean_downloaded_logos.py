
import os
import xml.etree.ElementTree as ET
import re

brands_dir = os.path.join(os.getcwd(), 'public/brands')
targets = [
    'alfa.svg', 'daewoo.svg', 'dodge.svg', 'jaguar.svg', 'lada.svg', 
    'lancia.svg', 'land-rover.svg', 'lexus.svg', 'saab.svg', 'subaru.svg', 'volvo.svg'
]

ET.register_namespace('', "http://www.w3.org/2000/svg")

def clean_svg(path):
    try:
        tree = ET.parse(path)
        root = tree.getroot()
        
        # Get dimensions
        viewBox = root.attrib.get('viewBox')
        width = root.attrib.get('width')
        height = root.attrib.get('height')
        
        # approximate viewbox area
        vb_w, vb_h = 100, 100
        if viewBox:
            nums = [float(x) for x in viewBox.split()]
            if len(nums) == 4: vb_w, vb_h = nums[2], nums[3]
        elif width and height:
            vb_w = float(re.sub(r'[^\d\.]', '', width))
            vb_h = float(re.sub(r'[^\d\.]', '', height))
            
        vb_area = vb_w * vb_h
        
        # Iterate all elements
        # We want to REMOVE backgrounds (paths that cover > 90% area)
        # And convert fills to currentColor
        
        # We need to collect valid paths
        to_remove = []
        
        for elem in root.iter():
            # Check if it has 'fill' or 'style'
            fill = elem.attrib.get('fill')
            style = elem.attrib.get('style', '')
            
            # Simple heuristic for background:
            # If it's a Rect or Path covering whole viewbox
            # Hard to detect path area without library.
            # But we can check color.
            # If color is White (#FFF, #FFFFFF, white), it's likely background (or negative space).
            # If we remove white background, we see transparent. Good.
            # If we convert white negative space to CurrentColor, it becomes black blob. BAD.
            
            # Strategy:
            # 1. Identify "White" elements -> Make them Transparent (fill="none") or Remove?
            #    If it's a background rect, removing is best.
            #    If it's a cutout inside a black shape (e.g. the 'L' in Lexus oval?), removing it makes it transparent window. GOOD.
            # 2. Identify "Color" elements -> Make them CurrentColor.
            
            is_white = False
            if fill:
                if fill.lower() in ['#fff', '#ffffff', 'white', '#f2f8f6']: is_white = True
            if 'fill:#fff' in style.lower() or 'fill:white' in style.lower(): is_white = True
            
            if is_white:
                # Likely background or cutout.
                # We should set fill="none" (transparent) to let background show through (which is page bg).
                # Wait, if page is white, and logo is black, a transparent hole looks white. Correct.
                # But if we force `fill="currentColor"` on EVERYTHING in CSS, does it override `fill="none"`?
                # Usually YES if we use `svg * { fill: currentColor }`.
                # We must ensure the element does NOT receive the fill.
                # In current codebase, we likely apply `text-primary` class to the SVG.
                # This makes `fill="currentColor"` elements take the color.
                # Elements with `fill="none"` stay transparent?
                # Yes, unless CSS targets `path`.
                
                # So: White -> fill="none" (or remove attribute if it defaults to black? No, explicit none).
                elem.attrib['fill'] = 'none'
                # Remove style fill
                if 'fill' in style:
                    new_style = re.sub(r'fill:[^;]+;?', '', style)
                    elem.attrib['style'] = new_style
            else:
                # Colored (Black, Blue, Red, etc.) -> currentColor
                # But only if it has a fill!
                if fill and fill != 'none':
                    elem.attrib['fill'] = 'currentColor'
                
                if 'fill' in style and 'none' not in style:
                     # Update style? Hard regex. simpler to wipe style fill and use attr
                     pass
                     
                # Handle Stroke
                stroke = elem.attrib.get('stroke')
                if stroke and stroke != 'none':
                    elem.attrib['stroke'] = 'currentColor'

        # Force root fill?
        root.attrib['fill'] = 'currentColor'
        
        tree.write(path)
        print(f"Cleaned {os.path.basename(path)}")
        
    except Exception as e:
        print(f"Error cleaning {path}: {e}")

for t in targets:
    p = os.path.join(brands_dir, t)
    if os.path.exists(p):
        clean_svg(p)
