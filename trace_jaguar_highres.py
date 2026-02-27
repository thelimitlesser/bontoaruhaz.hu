import cv2
import numpy as np

img_path = "/Users/erdelyipeter/.gemini/antigravity/brain/ab71b789-e3b4-4433-acb7-d09bb2c18e6d/media__1771709482505.png"
img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)

if img is None:
    print("Error: Could not read image.")
    exit(1)

# The image is black on white/transparent
# Extract black parts
if img.shape[2] == 4:
    # Handle alpha
    alpha = img[:, :, 3]
    color = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    # Mask is where alpha is high and color is dark
    mask = cv2.bitwise_and(alpha, cv2.bitwise_not(color))
else:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)

# Find ALL contours (External and Internal)
contours, _ = cv2.findContours(mask, cv2.RETR_LIST, cv2.CHAIN_APPROX_TC89_L1)

def contour_to_svg_path(contour):
    points = contour.squeeze()
    if len(points) < 3: return ""
    path_data = f"M {points[0][0]} {points[0][1]} "
    for p in points[1:]:
        path_data += f"L {p[0]} {p[1]} "
    path_data += "Z"
    return path_data

# Combine all valid paths
all_paths = " ".join([contour_to_svg_path(cnt) for cnt in contours if cv2.contourArea(cnt) > 1])

# Calculate bounding box
x, y, w, h = cv2.boundingRect(mask)
padding = 10
viewbox = f"{x-padding} {y-padding} {w+2*padding} {h+2*padding}"

svg_content = f'''<svg viewBox="{viewbox}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <path fill="white" fill-rule="evenodd" d="{all_paths}"/>
</svg>'''

with open("public/brands/jaguar-brand-final-v7.svg", "w") as f:
    f.write(svg_content)

print(f"Generated Jaguar v7 from {len(contours)} contours.")
