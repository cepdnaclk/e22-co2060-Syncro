from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Profile, User
from ..schemas.schemas import ProfileResponse, ProfileCreate, ProfileUpdate
from ..api.auth import get_current_user_from_token
from ..utils.media import upload_image_to_cloudinary

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/", response_model=ProfileResponse)
def create_profile(profile_data: ProfileCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_from_token)):
    user_id = current_user.id
    existing_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if existing_profile:
         raise HTTPException(status_code=400, detail="Profile already exists")
    
    new_profile = Profile(**profile_data.dict(), user_id=user_id)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.put("/me", response_model=ProfileResponse)
def update_profile(profile_data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_from_token)):
    user_id = current_user.id
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    if not profile:
        profile = Profile(
            user_id=user_id, 
            name=f"{current_user.first_name} {current_user.last_name}".strip() or "User"
        )
        db.add(profile)
        db.flush()
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/upload")
async def upload_profile_image(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user_from_token)
):
    try:
        url = upload_image_to_cloudinary(image.file)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
