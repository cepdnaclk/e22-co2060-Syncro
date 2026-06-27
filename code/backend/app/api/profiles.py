from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..models.models import Profile, User
from ..schemas.schemas import ProfileResponse, ProfileCreate, ProfileUpdate
from ..api.auth import get_current_user_from_token
from ..utils.media import upload_image

router = APIRouter(prefix="/profiles", tags=["Profiles"])


# ── Seller summary schema (used by the "New Message" picker) ──────────────────
class SellerSummary(BaseModel):
    user_id: int
    name: str
    description: Optional[str] = None
    logo: Optional[str] = None
    display_name: str  # "First Last" from the User table

    class Config:
        from_attributes = True


# ── List all sellers with completed profiles ──────────────────────────────────
@router.get("/", response_model=List[SellerSummary])
def list_sellers(db: Session = Depends(get_db)):
    """
    Return all profiles that have a non-empty description (i.e. completed
    seller profiles). Joined with the User table to include a human-readable
    display name. Used by the frontend "New Message" seller picker.
    """
    profiles = (
        db.query(Profile)
        .filter(Profile.description.isnot(None), Profile.description != "")
        .all()
    )
    results = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        if not user:
            continue
        display = f"{user.first_name or ''} {user.last_name or ''}".strip()
        if not display:
            display = user.email
        results.append(
            SellerSummary(
                user_id=p.user_id,
                name=p.name or display,
                description=p.description,
                logo=p.logo,
                display_name=display,
            )
        )
    return results


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
        url = upload_image(image.file)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
