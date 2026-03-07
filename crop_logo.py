from PIL import Image

def crop_symbol():
    try:
        img = Image.open('code/frontend/public/logo.jpg')
        width, height = img.size
        # The user's image is a square (approx 1024x1024)
        # The 'S' made of 3 lines is on the left side
        # Let's crop the left half, and then maybe specific coordinates.
        # Actually, let's just crop to a reasonable box for the 'S'.
        # Since I can't see the exact pixel coordinates, I'll crop the left third, vertical middle
        left = width * 0.1
        top = height * 0.2
        right = width * 0.5
        bottom = height * 0.8
        
        cropped = img.crop((left, top, right, bottom))
        cropped.save('code/frontend/public/logo_icon.jpg')
        print(f"Original size: {width}x{height}, Cropped size: {cropped.size}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    crop_symbol()
