from PIL import Image
import os

def crop_logo(input_path, output_path):
    print(f"Loading image from {input_path}...")
    img = Image.open(input_path)
    
    # Convert image to RGBA if it isn't
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get the bounding box of non-white pixels
    # We look for pixels that are not pure white (255, 255, 255)
    # or have some transparency
    bbox = img.getbbox()
    
    # If getbbox doesn't work well (e.g. if the background isn't 100% transparent/white)
    # we can do manual detection, but usually for PNGs it works.
    
    # Let's try to be smarter and ignore white pixels
    # Find data where alpha > 0 or color != white
    import numpy as np
    data = np.array(img)
    mask = (data[:,:,3] > 0) & ((data[:,:,0] < 250) | (data[:,:,1] < 250) | (data[:,:,2] < 250))
    
    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    
    width = x1 - x0
    height = y1 - y0
    
    # Add a tiny bit of padding (2%)
    padding = int(max(width, height) * 0.02)
    left = max(0, x0 - padding)
    top = max(0, y0 - padding)
    right = min(img.width, x1 + padding)
    bottom = min(img.height, y1 + padding)
    
    # Crop it
    cropped = img.crop((left, top, right, bottom))
    
    # Ensure it's square if possible (favicons like square)
    c_w, c_h = cropped.size
    new_size = max(c_w, c_h)
    new_img = Image.new("RGBA", (new_size, new_size), (255, 255, 255, 0))
    new_img.paste(cropped, ((new_size - c_w) // 2, (new_size - c_h) // 2))
    
    print(f"Saving cropped image to {output_path} (Size: {new_size}x{new_size})...")
    new_img.save(output_path)

if __name__ == "__main__":
    input_file = "/Users/erdelyipeter/BONTOARUHAZ/autonexus/public/logo_orange.png"
    output_file = "/Users/erdelyipeter/BONTOARUHAZ/autonexus/public/icon-tight.png"
    
    if os.path.exists(input_file):
        crop_logo(input_file, output_file)
        print("Success!")
    else:
        print(f"Error: {input_file} not found.")
