from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.models.faculty import FacultyCreate, FacultyUpdate
from app.core.database import get_database
from app.core.deps import get_current_admin, get_current_user
from app.services.rag_service import rag_service

router = APIRouter(prefix="/faculty", tags=["Faculty"])

def format_faculty_doc(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "department": doc.get("department", ""),
        "designation": doc.get("designation", ""),
        "officeRoom": doc.get("officeRoom", ""),
        "email": doc.get("email", ""),
        "contactNumber": doc.get("contactNumber", ""),
        "officeHours": doc.get("officeHours", ""),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", "")
    }

@router.get("")
@router.get("/")
async def get_all_faculty():
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": False,
                "data": [],
                "message": "Database connection unavailable",
                "statusCode": 503
            }
        )
    
    faculty_collection = db["faculty"]
    cursor = faculty_collection.find({}).sort("createdAt", -1)
    faculties = await cursor.to_list(length=500)
    
    formatted_faculties = [format_faculty_doc(f) for f in faculties]
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": formatted_faculties,
            "message": "Faculty list fetched successfully",
            "statusCode": 200
        }
    )

@router.post("")
@router.post("/")
async def add_faculty(
    faculty_in: FacultyCreate,
    current_admin: dict = Depends(get_current_admin)
):
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

    faculty_collection = db["faculty"]

    # Check if faculty with same email already exists in faculty collection
    existing_faculty = await faculty_collection.find_one({"email": faculty_in.email.lower()})
    if existing_faculty:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "A faculty member with this email already exists!",
                "statusCode": 400
            }
        )

    now_str = datetime.utcnow().isoformat()
    new_doc = {
        "name": faculty_in.name,
        "department": faculty_in.department,
        "designation": faculty_in.designation,
        "officeRoom": faculty_in.officeRoom,
        "email": faculty_in.email.lower(),
        "contactNumber": faculty_in.contactNumber,
        "officeHours": faculty_in.officeHours,
        "createdAt": now_str,
        "updatedAt": now_str
    }

    result = await faculty_collection.insert_one(new_doc)
    new_doc["_id"] = result.inserted_id

    # Auto sync RAG index
    try:
        await rag_service.index_all_data(db)
    except Exception:
        pass

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "status": True,
            "data": format_faculty_doc(new_doc),
            "message": "Faculty member added successfully!",
            "statusCode": 201
        }
    )

@router.put("/{faculty_id}")
async def update_faculty(
    faculty_id: str,
    faculty_in: FacultyUpdate,
    current_admin: dict = Depends(get_current_admin)
):
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

    faculty_collection = db["faculty"]

    try:
        obj_id = ObjectId(faculty_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid faculty ID format",
                "statusCode": 400
            }
        )

    existing_faculty = await faculty_collection.find_one({"_id": obj_id})
    if not existing_faculty:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Faculty member not found",
                "statusCode": 404
            }
        )

    update_data = {k: v for k, v in faculty_in.model_dump().items() if v is not None}
    if "email" in update_data:
        update_data["email"] = update_data["email"].lower()
    
    update_data["updatedAt"] = datetime.utcnow().isoformat()

    await faculty_collection.update_one({"_id": obj_id}, {"$set": update_data})
    updated_doc = await faculty_collection.find_one({"_id": obj_id})

    # Auto sync RAG index
    try:
        await rag_service.index_all_data(db)
    except Exception:
        pass

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": format_faculty_doc(updated_doc),
            "message": "Faculty member updated successfully!",
            "statusCode": 200
        }
    )

@router.delete("/{faculty_id}")
async def delete_faculty(
    faculty_id: str,
    current_admin: dict = Depends(get_current_admin)
):
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

    faculty_collection = db["faculty"]

    try:
        obj_id = ObjectId(faculty_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid faculty ID format",
                "statusCode": 400
            }
        )

    result = await faculty_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Faculty member not found",
                "statusCode": 404
            }
        )

    # Auto sync RAG index
    try:
        await rag_service.index_all_data(db)
    except Exception:
        pass

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {"id": faculty_id},
            "message": "Faculty member deleted successfully!",
            "statusCode": 200
        }
    )
