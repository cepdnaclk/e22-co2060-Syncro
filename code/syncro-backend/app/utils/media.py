# app/utils/media.py
import cloudinary.uploader

def upload_image_to_cloudinary(file, folder="syncro_listings"):
    try:
        # Upload the file object directly to Cloudinary
        result = cloudinary.uploader.upload(file, folder=folder)
        return result.get("secure_url")
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None