from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Optional
from bson import ObjectId

from app.models.user import UserRegister, UserLogin, UserRoleEnum
from app.core.database import get_database
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_doc(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "fullName": doc.get("fullName", ""),
        "email": doc.get("email", ""),
        "idNumber": doc.get("idNumber", ""),
        "department": doc.get("department", ""),
        "role": doc.get("role", "student"),
        "createdAt": doc.get("createdAt", "")
    }

@router.post("/register")
@router.post("/signup")
async def register(user_in: UserRegister):
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": False,
                "data": None,
                "message": "Database connection unavailable",
                "statusCode": 503
            }
        )
    
    users_collection = db["users"]

    # Check if user already exists by email or idNumber
    existing_user = await users_collection.find_one({
        "$or": [
            {"email": user_in.email.lower()},
            {"idNumber": user_in.idNumber}
        ]
    })

    if existing_user:
        if existing_user.get("email") == user_in.email.lower():
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "status": False,
                    "data": None,
                    "message": "An account with this email already exists!",
                    "statusCode": 400
                }
            )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "An account with this ID number already exists!",
                "statusCode": 400
            }
        )

    # Hash password and insert document
    now_str = datetime.utcnow().isoformat()
    new_user_doc = {
        "fullName": user_in.fullName,
        "email": user_in.email.lower(),
        "idNumber": user_in.idNumber,
        "department": user_in.department,
        "role": user_in.role.value,
        "password": hash_password(user_in.password),
        "createdAt": now_str,
        "updatedAt": now_str
    }

    result = await users_collection.insert_one(new_user_doc)
    new_user_doc["_id"] = result.inserted_id

    formatted_user = format_user_doc(new_user_doc)

    # Generate JWT token
    token = create_access_token({
        "sub": formatted_user["id"],
        "email": formatted_user["email"],
        "role": formatted_user["role"]
    })

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "status": True,
            "data": {
                "user": formatted_user,
                "token": token
            },
            "message": "Account registered successfully!",
            "statusCode": 201
        }
    )

@router.post("/login")
@router.post("/signin")
async def login(user_in: UserLogin):
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": False,
                "data": None,
                "message": "Database connection unavailable",
                "statusCode": 503
            }
        )
    
    users_collection = db["users"]

    # 1. Check if user exists in database
    user_doc = await users_collection.find_one({"email": user_in.email.lower()})

    if not user_doc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "User is not registered! Please create an account first.",
                "statusCode": 404
            }
        )

    # 2. Verify password hash
    if not verify_password(user_in.password, user_doc.get("password", "")):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "status": False,
                "data": None,
                "message": "Incorrect password! Please check your credentials.",
                "statusCode": 401
            }
        )

    # 3. Verify role match if role provided
    if user_in.role and user_doc.get("role") != user_in.role:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "status": False,
                "data": None,
                "message": f"Account role mismatch! This email is registered as '{user_doc.get('role')}', not '{user_in.role}'.",
                "statusCode": 403
            }
        )

    formatted_user = format_user_doc(user_doc)

    token = create_access_token({
        "sub": formatted_user["id"],
        "email": formatted_user["email"],
        "role": formatted_user["role"]
    })

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {
                "user": formatted_user,
                "token": token
            },
            "message": "Login successful!",
            "statusCode": 200
        }
    )

@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return {
            "status": False,
            "data": None,
            "message": "Unauthorized access token missing",
            "statusCode": 401
        }
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        return {
            "status": False,
            "data": None,
            "message": "Invalid or expired access token",
            "statusCode": 401
        }

    db = get_database()
    users_collection = db["users"]
    
    try:
        user_doc = await users_collection.find_one({"_id": ObjectId(payload["sub"])})
    except Exception:
        user_doc = None

    if not user_doc:
        return {
            "status": False,
            "data": None,
            "message": "User not found",
            "statusCode": 404
        }

    return {
        "status": True,
        "data": {
            "user": format_user_doc(user_doc)
        },
        "message": "User profile fetched successfully",
        "statusCode": 200
    }
