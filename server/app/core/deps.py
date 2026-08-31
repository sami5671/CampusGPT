from fastapi import Header, Cookie, HTTPException, status, Depends
from typing import Optional
from bson import ObjectId
from app.core.security import decode_access_token
from app.core.database import get_database

def extract_token(
    authorization: Optional[str],
    admin_token: Optional[str],
    campus_gpt: Optional[str]
) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()
        if token and token != "undefined" and token != "null":
            return token
    if admin_token and admin_token.strip():
        return admin_token.strip()
    if campus_gpt and campus_gpt.strip():
        return campus_gpt.strip()
    return None

async def get_current_user(
    authorization: Optional[str] = Header(None),
    admin_token: Optional[str] = Cookie(None),
    campusGPT: Optional[str] = Cookie(None)
) -> dict:
    token = extract_token(authorization, admin_token, campusGPT)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Access token missing or invalid format"
        )
    
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

async def get_optional_user(
    authorization: Optional[str] = Header(None),
    admin_token: Optional[str] = Cookie(None),
    campusGPT: Optional[str] = Cookie(None)
) -> Optional[dict]:
    token = extract_token(authorization, admin_token, campusGPT)
    if not token:
        return None
    
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        return None
    
    db = get_database()
    if db is None:
        return None
    
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(payload["sub"])})
        return user_doc
    except Exception:
        return None
