with open("alfa_raw.svg", "r") as f:
    content = f.read()

# Make all filled areas white
import re

content = re.sub(r'fill="[^"]+"', 'fill="white"', content)
content = re.sub(r'stroke="[^"]+"', 'stroke="transparent"', content)
content = content.replace('width="1000"', 'width="100%"').replace('height="1000"', 'height="100%"')

# However, simply making everything white on a multi-layered colored SVG will result in a solid white circle because the background circle is also filled solid white.
# We need an inherently transparent monochrome version. 
# Better yet, I will use a high quality simple-icons fallback I missed or a purely text one that is actually good.
import os
