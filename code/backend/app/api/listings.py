# app/api/listings.py
from fastapi import APIRouter, UploadFile, File, Form, Depends
from ..utils.media import upload_image_to_cloudinary
from ..models.models import Listing
from ..database import get_db
from sqlalchemy.orm import Session


@router.post("/listings/create")
async def create_listing_with_image(
    title: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Upload the photo to Cloudinary
    image_url = upload_image_to_cloudinary(image.file)
    
    # 2. Save the listing and the Cloudinary URL to PostgreSQL
    new_listing = Listing(
        title=title,
        price=price,
        description=description,
        image_url=image_url
    )
    db.add(new_listing)
    db.commit()
    
    return {"message": "Listing created", "url": image_url}