import cv2
import numpy as np

img_path = "/Users/erdelyipeter/.gemini/antigravity/brain/ab71b789-e3b4-4433-acb7-d09bb2c18e6d/media__1771697387880.png"
img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)

if img.shape[2] == 4:
    alpha = img[:, :, 3]
    gray = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    mask = (gray < 200) & (alpha > 50)
else:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mask = gray < 200

mask_uint8 = (mask * 255).astype(np.uint8)

contours, hierarchy = cv2.findContours(mask_uint8, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)

svg_width, svg_height = img.shape[1], img.shape[0]

x_min, y_min, x_max, y_max = svg_width, svg_height, 0, 0
for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    if x < x_min: x_min = x
    if y < y_min: y_min = y
    if x+w > x_max: x_max = x+w
    if y+h > y_max: y_max = y+h

with open("public/brands/dodge-brand.svg", "w") as f:
    f.write(f'<svg viewBox="{x_min-2} {y_min-2} {x_max-x_min+4} {y_max-y_min+4}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill="white">\n')
    
    combined_path = ""
    for cnt in contours:
        epsilon = 0.0005 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        if len(approx) > 2:
            path_str = f"M {approx[0][0][0]} {approx[0][0][1]} "
            for pt in approx[1:]:
                path_str += f"L {pt[0][0]} {pt[0][1]} "
            path_str += "Z "
            combined_path += path_str

    f.write(f'\t<path fill-rule="evenodd" clip-rule="evenodd" d="{combined_path}"/>\n')
    f.write('</svg>\n')

print("Created fixed Dodge SVG with holes.")
