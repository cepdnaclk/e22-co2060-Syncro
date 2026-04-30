# app/utils/media.py
from imagekitio import ImageKit
from ..core.config import settings


def _get_imagekit() -> ImageKit:
    """Initialise and return an ImageKit v5 client."""
    return ImageKit(private_key=settings.IMAGEKIT_PRIVATE_KEY)


def upload_image(file, folder: str = "syncro_listings") -> str | None:
    """Upload a file-like object to ImageKit and return its public URL."""
    try:
        ik = _get_imagekit()
        result = ik.files.upload(
            file=file,
            file_name="upload",
            folder=f"/{folder}/",
        )
        return result.url
    except Exception as e:
        print(f"Error uploading to ImageKit: {e}")
        return None