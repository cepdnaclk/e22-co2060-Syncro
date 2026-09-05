# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..models.models import User, EmailVerificationOTP
from ..schemas.schemas import UserCreate, UserLogin, Token, UserResponse, UserUpdate, VerifyEmailRequest, ResendVerificationRequest
from ..core.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ..utils.otp import generate_otp, hash_otp, verify_otp_hash

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This is a basic implementation. Ideally, decode the JWT and fetch the user.
    # We will refine this if the frontend needs secure backend routes.
    import jwt
    from ..core.security import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError as e:
        print(f"Token decode failure: {e} (Secret key used: {SECRET_KEY})")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/auth/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        location=user.location,
        phone_number=user.phone_number,
        active_role="client",
        email_verified=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    from ..models.models import Profile
    profile_name = f"{new_user.first_name or ''} {new_user.last_name or ''}".strip()
    if not profile_name:
        profile_name = new_user.email.split('@')[0]

    new_profile = Profile(
        user_id=new_user.id,
        name=profile_name,
        phone=new_user.phone_number,
        description=""
    )
    db.add(new_profile)
    db.commit()

    try:
        otp = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=5)

        db.query(EmailVerificationOTP).filter(
            EmailVerificationOTP.email == user.email,
            EmailVerificationOTP.used == False,
        ).update({"used": True})

        otp_record = EmailVerificationOTP(
            email=user.email,
            otp_hash=hash_otp(otp),
            otp=None,
            expires_at=expires_at,
            attempt_count=0,
            used=False,
        )
        db.add(otp_record)
        db.commit()

        from ..utils.email import send_otp_email

        try:
            send_otp_email(to_email=user.email, otp=otp, purpose="verification")
        except Exception as exc:
            db.rollback()
            db.query(EmailVerificationOTP).filter(EmailVerificationOTP.id == otp_record.id).delete(synchronize_session=False)
            db.query(Profile).filter(Profile.user_id == new_user.id).delete(synchronize_session=False)
            db.query(User).filter(User.id == new_user.id).delete(synchronize_session=False)
            db.commit()
            raise HTTPException(
                status_code=503,
                detail="Unable to send the verification email. Please try again later."
            ) from exc
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        db.query(Profile).filter(Profile.user_id == new_user.id).delete(synchronize_session=False)
        db.query(User).filter(User.id == new_user.id).delete(synchronize_session=False)
        db.commit()
        raise HTTPException(status_code=500, detail="Unable to create account. Please try again later.") from exc

    return {"message": "Account created. Please check your email for the verification code."}

@router.post("/auth/verify-email", response_model=Token)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    otp_record = (
        db.query(EmailVerificationOTP)
        .filter(
            EmailVerificationOTP.email == payload.email,
            EmailVerificationOTP.used == False,
        )
        .order_by(EmailVerificationOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(status_code=400, detail="No pending verification found. Please request a new code.")

    if otp_record.attempt_count >= 5:
        otp_record.used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Too many incorrect attempts. Please request a new verification code.")

    if datetime.utcnow() > otp_record.expires_at:
        otp_record.used = True
        db.commit()
        raise HTTPException(status_code=400, detail="This verification code has expired. Please request a new code.")

    submitted_otp = (payload.otp or '').strip()
    stored_hash = otp_record.otp_hash or ''
    if stored_hash:
        otp_matches = verify_otp_hash(submitted_otp, stored_hash)
    else:
        otp_matches = bool(otp_record.otp and otp_record.otp == submitted_otp)

    if not submitted_otp or not otp_matches:
        otp_record.attempt_count += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid verification code. Please try again.")

    otp_record.used = True
    user.email_verified = True
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.active_role}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "role": user.active_role, "first_name": user.first_name}


@router.post("/auth/resend-verification")
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": "If this email is registered, a new verification code has been sent."}

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    latest_otp = (
        db.query(EmailVerificationOTP)
        .filter(EmailVerificationOTP.email == payload.email)
        .order_by(EmailVerificationOTP.created_at.desc())
        .first()
    )
    if latest_otp and latest_otp.created_at and datetime.utcnow() < latest_otp.created_at + timedelta(seconds=60):
        raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting a new code.")

    db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.email == payload.email,
        EmailVerificationOTP.used == False,
    ).update({"used": True})
    db.commit()

    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    otp_record = EmailVerificationOTP(
        email=payload.email,
        otp_hash=hash_otp(otp),
        otp=None,
        expires_at=expires_at,
        used=False,
        attempt_count=0,
        last_sent_at=datetime.utcnow(),
    )
    db.add(otp_record)
    db.commit()

    try:
        from ..utils.email import send_otp_email
        send_otp_email(to_email=payload.email, otp=otp, purpose="verification")
    except Exception as exc:
        db.rollback()
        db.query(EmailVerificationOTP).filter(EmailVerificationOTP.id == otp_record.id).delete(synchronize_session=False)
        db.commit()
        raise HTTPException(
            status_code=503,
            detail="Unable to send the verification email. Please try again later."
        ) from exc

    return {"message": "A new verification code has been sent to your email."}


@router.post("/auth/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not db_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in."
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.active_role}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": db_user.id, "role": db_user.active_role, "first_name": db_user.first_name}


@router.post("/auth/toggle-role")
async def toggle_role(current_user: User = Depends(get_current_user_from_token), db: Session = Depends(get_db)):
    new_role = "seller" if current_user.active_role == "client" else "client"
    current_user.active_role = new_role
    
    db.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_token = create_access_token(
        data={"sub": current_user.email, "role": new_role}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "active_role": new_role,
        "user_id": current_user.id,
        "first_name": current_user.first_name
    }

@router.get("/auth/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user_from_token)):
    return current_user


@router.patch("/auth/me", response_model=UserResponse)
def update_current_user(
    data: UserUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    if data.first_name is not None:
        current_user.first_name = data.first_name
    if data.last_name is not None:
        current_user.last_name = data.last_name
    if data.location is not None:
        current_user.location = data.location
    if data.phone_number is not None:
        current_user.phone_number = data.phone_number
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/auth/me")
async def delete_account(current_user: User = Depends(get_current_user_from_token), db: Session = Depends(get_db)):
    from ..models.models import Review, Order, Bid, BidRequest, Listing, Profile
    from sqlalchemy import text
    user_id = current_user.id

    # 1. Delete reviews where this user is reviewer or reviewee
    db.query(Review).filter(
        (Review.reviewer_id == user_id) | (Review.reviewee_id == user_id)
    ).delete(synchronize_session=False)

    # 2. Nullify listing_id on orders linked to user's listings, then delete orders
    db.execute(text(
        "UPDATE orders SET listing_id = NULL WHERE listing_id IN "
        "(SELECT id FROM listings WHERE seller_id = :uid)"
    ), {"uid": user_id})
    db.execute(text(
        "DELETE FROM orders WHERE buyer_id = :uid OR seller_id = :uid"
    ), {"uid": user_id})

    # 3. Delete bids placed by this user (uses actual DB column: seller_id)
    db.execute(text("DELETE FROM bids WHERE seller_id = :uid"), {"uid": user_id})

    # 4. Delete bids referencing this user's bid_requests (actual FK col: bid_request_id)
    db.execute(text(
        "DELETE FROM bids WHERE bid_request_id IN "
        "(SELECT id FROM bid_requests WHERE user_id = :uid)"
    ), {"uid": user_id})

    # 5. Delete bid_requests
    db.execute(text("DELETE FROM bid_requests WHERE user_id = :uid"), {"uid": user_id})

    # 6. Delete listings
    db.execute(text("DELETE FROM listings WHERE seller_id = :uid"), {"uid": user_id})

    # 7. Delete profile
    db.execute(text("DELETE FROM profiles WHERE user_id = :uid"), {"uid": user_id})

    # 8. Delete notifications
    db.execute(text("DELETE FROM notifications WHERE user_id = :uid"), {"uid": user_id})

    # 9. Delete messages sent or received by this user
    db.execute(text("DELETE FROM messages WHERE sender_id = :uid OR receiver_id = :uid"), {"uid": user_id})

    # 9. Finally delete the user
    db.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
    db.commit()

    return {"message": "Account deleted successfully"}


# ──────────────────────────────────────────────────────────────────────────────
# POST /auth/forgot-password
# ──────────────────────────────────────────────────────────────────────────────

from pydantic import BaseModel as PydanticBase

class ForgotPasswordRequest(PydanticBase):
    email: str

class VerifyOTPRequest(PydanticBase):
    email: str
    otp: str
    new_password: str


@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Step 1: User submits their email.
    - We ALWAYS return 200 to prevent email enumeration attacks.
    - If the email exists, generate a 6-digit OTP, save it to the DB,
      and send it to the user's inbox via Gmail SMTP.
    """
    import secrets
    from datetime import datetime, timedelta
    from ..models.models import PasswordResetOTP
    from ..utils.email import send_otp_email

    user = db.query(User).filter(User.email == payload.email).first()

    if user:
        # Invalidate any existing unused OTPs for this email
        db.query(PasswordResetOTP).filter(
            PasswordResetOTP.email == payload.email,
            PasswordResetOTP.used == False,
        ).update({"used": True})
        db.commit()

        otp = str(secrets.randbelow(900000) + 100000)  # 6-digit: 100000–999999
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        otp_record = PasswordResetOTP(
            email=payload.email,
            otp=otp,
            expires_at=expires_at,
        )
        db.add(otp_record)
        db.commit()

        try:
            send_otp_email(to_email=payload.email, otp=otp)
        except RuntimeError as e:
            # Gmail not configured — give a clear actionable message
            raise HTTPException(
                status_code=503,
                detail=(
                    "Email service not configured. "
                    "Please set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env "
                    "(generate an App Password at myaccount.google.com → Security → App passwords)."
                )
            )
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Could not send email. Check your Gmail App Password in backend/.env. Error: {str(e)}"
            )

    # Always return 200 (prevents email enumeration)
    return {"message": "If this email is registered, an OTP has been sent."}


# ──────────────────────────────────────────────────────────────────────────────
# POST /auth/reset-password
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/auth/reset-password")
def reset_password(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Step 2: User submits email + OTP + new password.
    - Validates OTP (correct, not expired, not used).
    - Hashes and saves the new password.
    - Marks the OTP as used.
    """
    from datetime import datetime
    from ..models.models import PasswordResetOTP

    otp_record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.email == payload.email,
            PasswordResetOTP.otp == payload.otp,
            PasswordResetOTP.used == False,
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please request a new one.")

    if datetime.utcnow() > otp_record.expires_at:
        otp_record.used = True
        db.commit()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = get_password_hash(payload.new_password)
    otp_record.used = True
    db.commit()

    print(f"Password reset for {payload.email}")
    return {"message": "Password reset successfully. You can now log in."}

