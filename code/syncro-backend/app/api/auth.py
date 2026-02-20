# app/api/auth.py
@router.post("/auth/toggle-role")
async def toggle_role(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Switch the role [cite: 12]
    new_role = "seller" if current_user.active_role == "client" else "client"
    current_user.active_role = new_role
    
    db.commit()
    
    # Generate a new token with the updated role [cite: 58, 59]
    new_token = create_access_token(data={"sub": current_user.email, "role": new_role})
    
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "active_role": new_role
    }