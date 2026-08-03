from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from bson import ObjectId

from app.models.class_model import ClassCreate, ClassUpdate
from app.core.database import get_database
from app.core.deps import get_current_admin

router = APIRouter(prefix="/classes", tags=["Classes Management"])

def get_bangladesh_now() -> datetime:
    """Returns current datetime in Bangladesh Standard Time (BST, UTC+6)."""
    bst_tz = timezone(timedelta(hours=6))
    return datetime.now(bst_tz)

def parse_time_to_minutes(t_str: str) -> int:
    try:
        t = t_str.strip().upper()
        is_pm = "PM" in t
        is_am = "AM" in t
        t_clean = t.replace("AM", "").replace("PM", "").strip()
        parts = t_clean.split(":")
        hrs = int(parts[0]) if parts[0] else 0
        mins = int(parts[1]) if len(parts) > 1 and parts[1] else 0
        if is_pm and hrs < 12:
            hrs += 12
        if is_am and hrs == 12:
            hrs = 0
        return hrs * 60 + mins
    except Exception:
        return 0

def compute_dynamic_status(start_time: str, end_time: str, days: Optional[List[str]] = None, manual_status: Optional[str] = None) -> str:
    try:
        now_bst = get_bangladesh_now()
        today_name = now_bst.strftime("%A")  # Saturday, Sunday, Monday, etc.
        current_mins = now_bst.hour * 60 + now_bst.minute

        start_mins = parse_time_to_minutes(start_time)
        end_mins = parse_time_to_minutes(end_time)

        if start_mins == 0 and end_mins == 0:
            return manual_status or "upcoming"

        # Check day matching
        day_matched = True
        if days and len(days) > 0:
            days_lower = [d.lower() for d in days]
            day_matched = today_name.lower() in days_lower

        # Handle overnight schedules (e.g. 10:00 PM [1320 mins] to 12:30 AM [30 mins])
        if end_mins < start_mins:
            is_running = (current_mins >= start_mins and day_matched) or (current_mins <= end_mins)
            if is_running:
                return "running"
            elif day_matched and current_mins < start_mins:
                return "upcoming"
            else:
                return "end"
        else:
            # Standard daytime schedule (e.g. 09:00 AM [540 mins] to 10:30 AM [630 mins])
            if not day_matched:
                return "upcoming"

            if start_mins <= current_mins <= end_mins:
                return "running"
            elif current_mins > end_mins:
                return "end"
            else:
                return "upcoming"
    except Exception:
        return manual_status or "upcoming"

def format_class_doc(doc: dict) -> dict:
    start_time = doc.get("startTime", "")
    end_time = doc.get("endTime", "")
    days = doc.get("days", [])
    stored_status = doc.get("status", "upcoming")
    
    # Calculate live status strictly based on BST and overnight logic
    live_status = compute_dynamic_status(start_time, end_time, days, stored_status)

    return {
        "id": str(doc["_id"]),
        "department": doc.get("department", ""),
        "courseCode": doc.get("courseCode", ""),
        "courseTitle": doc.get("courseTitle", ""),
        "instructorName": doc.get("instructorName", ""),
        "semester": doc.get("semester", ""),
        "buildingName": doc.get("buildingName", ""),
        "roomNumber": doc.get("roomNumber", ""),
        "startTime": start_time,
        "endTime": end_time,
        "days": days if isinstance(days, list) else [],
        "status": live_status,
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", "")
    }

@router.get("")
@router.get("/")
async def get_all_classes():
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
    
    classes_collection = db["classes"]
    cursor = classes_collection.find({}).sort("createdAt", -1)
    classes_docs = await cursor.to_list(length=500)
    
    formatted_classes = [format_class_doc(c) for c in classes_docs]
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": formatted_classes,
            "message": "Classes list retrieved successfully",
            "statusCode": 200
        }
    )

@router.post("")
@router.post("/")
async def add_class(
    class_in: ClassCreate,
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

    classes_collection = db["classes"]

    # Compute status based on Bangladesh Standard Time (BST) with overnight support
    computed_status = compute_dynamic_status(class_in.startTime, class_in.endTime, class_in.days, class_in.status)

    now_str = datetime.utcnow().isoformat()
    new_doc = {
        "department": class_in.department,
        "courseCode": class_in.courseCode,
        "courseTitle": class_in.courseTitle,
        "instructorName": class_in.instructorName,
        "semester": class_in.semester,
        "buildingName": class_in.buildingName,
        "roomNumber": class_in.roomNumber,
        "startTime": class_in.startTime,
        "endTime": class_in.endTime,
        "days": class_in.days,
        "status": computed_status,
        "createdAt": now_str,
        "updatedAt": now_str
    }

    result = await classes_collection.insert_one(new_doc)
    new_doc["_id"] = result.inserted_id

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "status": True,
            "data": format_class_doc(new_doc),
            "message": "Class added successfully!",
            "statusCode": 201
        }
    )

@router.put("/{class_id}")
async def update_class(
    class_id: str,
    class_in: ClassUpdate,
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

    classes_collection = db["classes"]

    try:
        obj_id = ObjectId(class_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid class ID format",
                "statusCode": 400
            }
        )

    existing_class = await classes_collection.find_one({"_id": obj_id})
    if not existing_class:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Class not found",
                "statusCode": 404
            }
        )

    update_data = {k: v for k, v in class_in.model_dump().items() if v is not None}
    
    start_t = update_data.get("startTime", existing_class.get("startTime", ""))
    end_t = update_data.get("endTime", existing_class.get("endTime", ""))
    days_list = update_data.get("days", existing_class.get("days", []))

    update_data["status"] = compute_dynamic_status(start_t, end_t, days_list, update_data.get("status"))
    update_data["updatedAt"] = datetime.utcnow().isoformat()

    await classes_collection.update_one({"_id": obj_id}, {"$set": update_data})
    updated_doc = await classes_collection.find_one({"_id": obj_id})

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": format_class_doc(updated_doc),
            "message": "Class updated successfully!",
            "statusCode": 200
        }
    )

@router.delete("/{class_id}")
async def delete_class(
    class_id: str,
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

    classes_collection = db["classes"]

    try:
        obj_id = ObjectId(class_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid class ID format",
                "statusCode": 400
            }
        )

    result = await classes_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Class entry not found",
                "statusCode": 404
            }
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {"id": class_id},
            "message": "Class entry deleted successfully!",
            "statusCode": 200
        }
    )
