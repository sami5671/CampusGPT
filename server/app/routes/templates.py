from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.models.template import TemplateCreate, TemplateUpdate
from app.core.database import get_database
from app.core.deps import get_current_admin

router = APIRouter(prefix="/templates", tags=["Application Templates"])

def format_template_doc(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "templateName": doc.get("templateName", ""),
        "imageUrl": doc.get("imageUrl", ""),
        "description": doc.get("description", ""),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", "")
    }

@router.get("")
@router.get("/")
async def get_all_templates():
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
    
    templates_collection = db["application_templates"]
    cursor = templates_collection.find({}).sort("createdAt", -1)
    templates = await cursor.to_list(length=500)
    
    formatted_templates = [format_template_doc(t) for t in templates]
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": formatted_templates,
            "message": "Application templates retrieved successfully",
            "statusCode": 200
        }
    )

@router.post("")
@router.post("/")
async def add_template(
    template_in: TemplateCreate,
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

    templates_collection = db["application_templates"]

    now_str = datetime.utcnow().isoformat()
    new_doc = {
        "templateName": template_in.templateName,
        "imageUrl": template_in.imageUrl,
        "description": template_in.description or "",
        "createdAt": now_str,
        "updatedAt": now_str
    }

    result = await templates_collection.insert_one(new_doc)
    new_doc["_id"] = result.inserted_id

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "status": True,
            "data": format_template_doc(new_doc),
            "message": "Application template added successfully!",
            "statusCode": 201
        }
    )

@router.put("/{template_id}")
async def update_template(
    template_id: str,
    template_in: TemplateUpdate,
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

    templates_collection = db["application_templates"]

    try:
        obj_id = ObjectId(template_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid template ID format",
                "statusCode": 400
            }
        )

    existing_template = await templates_collection.find_one({"_id": obj_id})
    if not existing_template:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Template entry not found",
                "statusCode": 404
            }
        )

    update_data = {k: v for k, v in template_in.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow().isoformat()

    await templates_collection.update_one({"_id": obj_id}, {"$set": update_data})
    updated_doc = await templates_collection.find_one({"_id": obj_id})

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": format_template_doc(updated_doc),
            "message": "Application template updated successfully!",
            "statusCode": 200
        }
    )

@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
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

    templates_collection = db["application_templates"]

    try:
        obj_id = ObjectId(template_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Invalid template ID format",
                "statusCode": 400
            }
        )

    existing_template = await templates_collection.find_one({"_id": obj_id})
    if not existing_template:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": False,
                "data": None,
                "message": "Template entry not found",
                "statusCode": 404
            }
        )

    deleted_image_url = existing_template.get("imageUrl", "")
    await templates_collection.delete_one({"_id": obj_id})

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {"id": template_id, "imageUrl": deleted_image_url},
            "message": "Application template deleted successfully!",
            "statusCode": 200
        }
    )
