from fastapi import Header, HTTPException, status, Depends
from typing import Optional
from bson import ObjectId
from app.core.security import decode_access_token
from app.core.database import get_database

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Access token missing or invalid format"
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or expired access token"
        )
    
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable"
        )
    
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(payload["sub"])})
    except Exception:
        user_doc = None

    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user_doc

async def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only admin members are authorized to perform this operation"
        )
    return current_user
