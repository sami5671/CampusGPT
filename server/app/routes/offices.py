from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.models.office import OfficeCreate, OfficeUpdate
from app.core.database import get_database
from app.core.deps import get_current_admin

router = APIRouter(prefix="/offices", tags=["Office Directory"])

def format_office_doc(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "officeName": doc.get("officeName", ""),
        "building": doc.get("building", ""),
        "floor": doc.get("floor", ""),
        "room": doc.get("room", ""),
        "phoneNumber": doc.get("phoneNumber", ""),
        "email": doc.get("email", ""),
        "officeHours": doc.get("officeHours", ""),
        "mapLink": doc.get("mapLink", ""),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", "")
    }

@router.get("")
@router.get("/")
async def get_all_offices():
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
    
    offices_collection = db["offices"]
    cursor = offices_collection.find({}).sort("createdAt", -1)
    offices = await cursor.to_list(length=500)
    
    formatted_offices = [format_office_doc(o) for o in offices]
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": formatted_offices,
            "message": "Office directory retrieved successfully",
            "statusCode": 200
        }
    )

@router.post("")
@router.post("/")
async def add_office(
    office_in: OfficeCreate,
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

    offices_collection = db["offices"]

    now_str = datetime.utcnow().isoformat()
    new_doc = {
        "officeName": office_in.officeName,
        "building": office_in.building,
        "floor": office_in.floor,
        "room": office_in.room,
        "phoneNumber": office_in.phoneNumber,
        "email": office_in.email.lower(),
        "officeHours": office_in.officeHours,
        "mapLink": office_in.mapLink or "",
        "createdAt": now_str,
        "updatedAt": now_str
    }

    result = await offices_collection.insert_one(new_doc)
    new_doc["_id"] = result.inserted_id

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "status": True,
            "data": format_office_doc(new_doc),
            "message": "Office directory entry added successfully!",
            "statusCode": 201
        }
    )

@router.put("/{office_id}")
async def update_office(
    office_id: str,
    office_in: OfficeUpdate,
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

    offices_collection = db["offices"]

    try:
        obj_id = ObjectId(office_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid office ID format",
                "statusCode": 400
            }
        )

    existing_office = await offices_collection.find_one({"_id": obj_id})
    if not existing_office:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Office entry not found",
                "statusCode": 404
            }
        )

    update_data = {k: v for k, v in office_in.model_dump().items() if v is not None}
    if "email" in update_data and update_data["email"]:
        update_data["email"] = update_data["email"].lower()
    
    update_data["updatedAt"] = datetime.utcnow().isoformat()

    await offices_collection.update_one({"_id": obj_id}, {"$set": update_data})
    updated_doc = await offices_collection.find_one({"_id": obj_id})

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": format_office_doc(updated_doc),
            "message": "Office directory entry updated successfully!",
            "statusCode": 200
        }
    )

@router.delete("/{office_id}")
async def delete_office(
    office_id: str,
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

    offices_collection = db["offices"]

    try:
        obj_id = ObjectId(office_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid office ID format",
                "statusCode": 400
            }
        )

    result = await offices_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Office entry not found",
                "statusCode": 404
            }
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {"id": office_id},
            "message": "Office directory entry deleted successfully!",
            "statusCode": 200
        }
    )
