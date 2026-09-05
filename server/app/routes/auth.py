from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Optional
from bson import ObjectId

from app.models.user import UserRegister, UserLogin, UserRoleEnum
from app.core.database import get_database
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

from pydantic import BaseModel, Field
from app.core.deps import get_current_user

def format_user_doc(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "fullName": doc.get("fullName", ""),
        "name": doc.get("fullName", ""),
        "email": doc.get("email", ""),
        "idNumber": doc.get("idNumber", ""),
        "department": doc.get("department", ""),
        "primaryNumber": doc.get("primaryNumber") or doc.get("phone", ""),
        "bloodGroup": doc.get("bloodGroup", ""),
        "gender": doc.get("gender", ""),
        "address": doc.get("address", ""),
        "currentSemester": doc.get("currentSemester", "Spring 2026"),
        "creditsEnrolled": doc.get("creditsEnrolled", "15 Credits"),
        "currentGPA": doc.get("currentGPA", "3.85"),
        "role": doc.get("role", "student"),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", "")
    }

class ChangeEmailRequest(BaseModel):
    newEmail: str
    currentPassword: str

@router.post("/change-email")
@router.patch("/change-email")
@router.put("/change-email")
async def change_email(
    payload: ChangeEmailRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Change logged-in user email address with password verification.
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database unavailable", "statusCode": 503}
        )

    user_id = current_user["_id"]
    user_doc = await db["users"].find_one({"_id": user_id})
    if not user_doc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"status": False, "data": None, "message": "User not found", "statusCode": 404}
        )

    if not verify_password(payload.currentPassword, user_doc.get("password", "")):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Current password is incorrect!", "statusCode": 400}
        )

    new_email_clean = payload.newEmail.strip().lower()
    if not new_email_clean or "@" not in new_email_clean:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Invalid email address!", "statusCode": 400}
        )

    if user_doc.get("email", "").lower() == new_email_clean:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "New email is the same as your current email!", "statusCode": 400}
        )

    existing_user = await db["users"].find_one({"email": new_email_clean, "_id": {"$ne": user_id}})
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "An account with this email already exists!", "statusCode": 400}
        )

    now_str = datetime.utcnow().isoformat()
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"email": new_email_clean, "updatedAt": now_str}}
    )

    updated_user_doc = await db["users"].find_one({"_id": user_id})
    formatted_user = format_user_doc(updated_user_doc)

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
            "message": "Email address updated successfully!",
            "statusCode": 200
        }
    )

class ChangePasswordRequest(BaseModel):
    oldPassword: str
    newPassword: str

@router.post("/change-password")
@router.patch("/change-password")
@router.put("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Change logged-in user password.
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database unavailable", "statusCode": 503}
        )

    user_id = current_user["_id"]
    user_doc = await db["users"].find_one({"_id": user_id})
    if not user_doc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"status": False, "data": None, "message": "User not found", "statusCode": 404}
        )

    if not verify_password(payload.oldPassword, user_doc.get("password", "")):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Current password is incorrect!", "statusCode": 400}
        )

    if len(payload.newPassword) < 6:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "New password must be at least 6 characters long!", "statusCode": 400}
        )

    if payload.oldPassword == payload.newPassword:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "New password must be different from current password!", "statusCode": 400}
        )

    hashed_new_pwd = hash_password(payload.newPassword)
    now_str = datetime.utcnow().isoformat()
    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"password": hashed_new_pwd, "updatedAt": now_str}}
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": None,
            "message": "Password updated successfully!",
            "statusCode": 200
        }
    )

class UpdateProfileRequest(BaseModel):
    fullName: Optional[str] = None
    primaryNumber: Optional[str] = None
    department: Optional[str] = None
    idNumber: Optional[str] = None
    bloodGroup: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    currentSemester: Optional[str] = None
    creditsEnrolled: Optional[str] = None
    currentGPA: Optional[str] = None

@router.patch("/profile")
@router.put("/profile")
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update logged-in user profile information.
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database unavailable", "statusCode": 503}
        )

    user_id = current_user["_id"]
    update_data = {}

    if payload.fullName is not None:
        update_data["fullName"] = payload.fullName.strip()
    if payload.primaryNumber is not None:
        update_data["primaryNumber"] = payload.primaryNumber.strip()
    if payload.department is not None:
        update_data["department"] = payload.department.strip()
    if payload.idNumber is not None:
        update_data["idNumber"] = payload.idNumber.strip()
    if payload.bloodGroup is not None:
        update_data["bloodGroup"] = payload.bloodGroup.strip()
    if payload.gender is not None:
        update_data["gender"] = payload.gender.strip()
    if payload.address is not None:
        update_data["address"] = payload.address.strip()
    if payload.currentSemester is not None:
        update_data["currentSemester"] = payload.currentSemester.strip()
    if payload.creditsEnrolled is not None:
        update_data["creditsEnrolled"] = payload.creditsEnrolled.strip()
    if payload.currentGPA is not None:
        update_data["currentGPA"] = payload.currentGPA.strip()

    update_data["updatedAt"] = datetime.utcnow().isoformat()

    await db["users"].update_one({"_id": user_id}, {"$set": update_data})
    updated_user_doc = await db["users"].find_one({"_id": user_id})

    formatted = format_user_doc(updated_user_doc)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {"user": formatted},
            "message": "Profile updated successfully!",
            "statusCode": 200
        }
    )

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
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "status": True,
        "data": {
            "user": format_user_doc(current_user)
        },
        "message": "User profile fetched successfully",
        "statusCode": 200
    }

class UpdateRolePayload(BaseModel):
    role: str

@router.get("/users")
@router.get("/users/")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Fetch list of all real registered users from MongoDB (admin only).
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database connection unavailable", "statusCode": 503}
        )

    if current_user.get("role") != "admin":
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"status": False, "data": None, "message": "Admin authorization required!", "statusCode": 403}
        )

    users_cursor = db["users"].find({}).sort("createdAt", -1)
    user_docs = await users_cursor.to_list(length=1000)
    formatted_users = [format_user_doc(u) for u in user_docs]

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": formatted_users,
            "message": "User list fetched successfully",
            "statusCode": 200
        }
    )

@router.patch("/users/{user_id}/role")
@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    payload: UpdateRolePayload,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a user's role (e.g. admin or student) in MongoDB (admin only).
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database connection unavailable", "statusCode": 503}
        )

    if current_user.get("role") != "admin":
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"status": False, "data": None, "message": "Admin authorization required!", "statusCode": 403}
        )

    new_role = payload.role.lower().strip()
    if new_role not in ["admin", "student", "staff", "faculty"]:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Invalid role specified!", "statusCode": 400}
        )

    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Invalid user ID format", "statusCode": 400}
        )

    now_str = datetime.utcnow().isoformat()
    result = await db["users"].update_one(
        {"_id": obj_id},
        {"$set": {"role": new_role, "updatedAt": now_str}}
    )

    if result.matched_count == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"status": False, "data": None, "message": "User not found", "statusCode": 404}
        )

    updated_user = await db["users"].find_one({"_id": obj_id})
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": format_user_doc(updated_user),
            "message": f"User role updated to '{new_role}' successfully!",
            "statusCode": 200
        }
    )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a real user from MongoDB (admin only).
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database connection unavailable", "statusCode": 503}
        )

    if current_user.get("role") != "admin":
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"status": False, "data": None, "message": "Admin authorization required!", "statusCode": 403}
        )

    if str(current_user["_id"]) == user_id:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "You cannot delete your own admin account!", "statusCode": 400}
        )

    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Invalid user ID format", "statusCode": 400}
        )

    result = await db["users"].delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"status": False, "data": None, "message": "User not found", "statusCode": 404}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": None,
            "message": "User account deleted successfully!",
            "statusCode": 200
        }
    )
