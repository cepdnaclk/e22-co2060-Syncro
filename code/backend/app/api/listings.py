# app/api/listings.py
from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import List
from ..utils.media import upload_image_to_cloudinary
from ..models.models import Listing, User
from ..schemas.schemas import ListingResponse
from ..database import get_db
from sqlalchemy.orm import Session
from ..api.auth import get_current_user_from_token

router = APIRouter()

@router.post("/listings/create")
async def create_listing_with_image(
    title: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    category_id: int = Form(...),
    delivery_time: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    image_url = None
    if image:
        # 1. Upload the photo to Cloudinary
        image_url = upload_image_to_cloudinary(image.file)
    
    # 2. Save the listing and the Cloudinary URL to PostgreSQL
    new_listing = Listing(
        title=title,
        price=price,
        description=description,
        category_id=category_id,
        delivery_time=delivery_time,
        image_url=image_url,
        seller_id=current_user.id
    )
    
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    
    return {"message": "Listing created", "listing": new_listing}

@router.get("/listings", response_model=List[ListingResponse])
async def get_listings(db: Session = Depends(get_db)):
    listings = db.query(Listing).all()
    return listings