from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.models.announcement import AnnouncementCreate, AnnouncementUpdate
from app.core.database import get_database
from app.core.deps import get_current_admin

router = APIRouter(prefix="/announcements", tags=["Announcements Management"])

def format_announcement_doc(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "content": doc.get("content", ""),
        "priority": doc.get("priority", "medium"),
        "category": doc.get("category", "General"),
        "imageUrl": doc.get("imageUrl", ""),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", "")
    }

@router.get("")
@router.get("/")
async def get_all_announcements():
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
    
    announcements_collection = db["announcements"]
    cursor = announcements_collection.find({}).sort("createdAt", -1)
    announcement_docs = await cursor.to_list(length=500)
    
    formatted_announcements = [format_announcement_doc(a) for a in announcement_docs]
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": formatted_announcements,
            "message": "Announcements retrieved successfully",
            "statusCode": 200
        }
    )

@router.post("")
@router.post("/")
async def add_announcement(
    announcement_in: AnnouncementCreate,
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

    announcements_collection = db["announcements"]

    now_str = datetime.utcnow().isoformat()
    new_doc = {
        "title": announcement_in.title,
        "content": announcement_in.content,
        "priority": announcement_in.priority.lower() if announcement_in.priority else "medium",
        "category": announcement_in.category or "General",
        "imageUrl": announcement_in.imageUrl or "",
        "createdAt": now_str,
        "updatedAt": now_str
    }

    result = await announcements_collection.insert_one(new_doc)
    new_doc["_id"] = result.inserted_id

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "status": True,
            "data": format_announcement_doc(new_doc),
            "message": "Announcement created successfully!",
            "statusCode": 201
        }
    )

@router.put("/{announcement_id}")
async def update_announcement(
    announcement_id: str,
    announcement_in: AnnouncementUpdate,
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

    announcements_collection = db["announcements"]

    try:
        obj_id = ObjectId(announcement_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid announcement ID format",
                "statusCode": 400
            }
        )

    existing_doc = await announcements_collection.find_one({"_id": obj_id})
    if not existing_doc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Announcement not found",
                "statusCode": 404
            }
        )

    update_data = {k: v for k, v in announcement_in.model_dump().items() if v is not None}
    if "priority" in update_data and update_data["priority"]:
        update_data["priority"] = update_data["priority"].lower()
        
    update_data["updatedAt"] = datetime.utcnow().isoformat()

    await announcements_collection.update_one({"_id": obj_id}, {"$set": update_data})
    updated_doc = await announcements_collection.find_one({"_id": obj_id})

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": format_announcement_doc(updated_doc),
            "message": "Announcement updated successfully!",
            "statusCode": 200
        }
    )

@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
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

    announcements_collection = db["announcements"]

    try:
        obj_id = ObjectId(announcement_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid announcement ID format",
                "statusCode": 400
            }
        )

    existing_doc = await announcements_collection.find_one({"_id": obj_id})
    if not existing_doc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Announcement not found",
                "statusCode": 404
            }
        )

    result = await announcements_collection.delete_one({"_id": obj_id})

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": format_announcement_doc(existing_doc),
            "message": "Announcement deleted successfully!",
            "statusCode": 200
        }
    )
