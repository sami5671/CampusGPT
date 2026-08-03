from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Optional

from app.core.database import get_database
from app.core.deps import get_current_admin
from app.routes.classes import compute_dynamic_status

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistics"])

@router.get("/stats")
async def get_dashboard_stats():
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

    # 1. Total Faculty count
    faculty_count = await db["faculty"].count_documents({})

    # 2. Total Offices count
    offices_count = await db["offices"].count_documents({})

    # 3. Application Templates count
    templates_count = await db["application_templates"].count_documents({})

    # 4. Classes count & Live Running classes count
    classes_cursor = db["classes"].find({})
    classes_docs = await classes_cursor.to_list(length=500)
    total_classes = len(classes_docs)
    running_classes = 0
    upcoming_classes = 0

    for c in classes_docs:
        s = compute_dynamic_status(c.get("startTime", ""), c.get("endTime", ""), c.get("days", []))
        if s == "running":
            running_classes += 1
        elif s == "upcoming":
            upcoming_classes += 1

    # 5. Total Announcements count & High priority count
    announcements_count = await db["announcements"].count_documents({})
    high_priority_count = await db["announcements"].count_documents({"priority": "high"})

    # 6. Real recent activities constructed from MongoDB collections
    recent_activities = []

    # Latest announcements
    ann_cursor = db["announcements"].find({}).sort("createdAt", -1).limit(4)
    recent_ann = await ann_cursor.to_list(length=4)
    for a in recent_ann:
        recent_activities.append({
            "id": str(a["_id"]),
            "action": f"Announcement: {a.get('title', '')}",
            "time": a.get("createdAt", ""),
            "type": "announcement",
            "priority": a.get("priority", "medium")
        })

    # Latest faculty
    fac_cursor = db["faculty"].find({}).sort("createdAt", -1).limit(3)
    recent_fac = await fac_cursor.to_list(length=3)
    for f in recent_fac:
        recent_activities.append({
            "id": str(f["_id"]),
            "action": f"Faculty Added: {f.get('name', '')} ({f.get('department', '')})",
            "time": f.get("createdAt", ""),
            "type": "faculty"
        })

    # Latest classes
    cls_cursor = db["classes"].find({}).sort("createdAt", -1).limit(3)
    recent_cls = await cls_cursor.to_list(length=3)
    for c in recent_cls:
        recent_activities.append({
            "id": str(c["_id"]),
            "action": f"Class Scheduled: {c.get('courseCode', '')} - {c.get('courseTitle', '')}",
            "time": c.get("createdAt", ""),
            "type": "class"
        })

    # Latest templates
    tpl_cursor = db["application_templates"].find({}).sort("createdAt", -1).limit(3)
    recent_tpl = await tpl_cursor.to_list(length=3)
    for t in recent_tpl:
        recent_activities.append({
            "id": str(t["_id"]),
            "action": f"Template Uploaded: {t.get('templateName', '')}",
            "time": t.get("createdAt", ""),
            "type": "template"
        })

    # Sort combined activities by timestamp desc
    recent_activities.sort(key=lambda x: x.get("time", ""), reverse=True)
    recent_activities = recent_activities[:7]

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {
                "totalFaculty": faculty_count,
                "totalOffices": offices_count,
                "totalTemplates": templates_count,
                "totalClasses": total_classes,
                "runningClasses": running_classes,
                "upcomingClasses": upcoming_classes,
                "totalAnnouncements": announcements_count,
                "highPriorityAnnouncements": high_priority_count,
                "recentActivities": recent_activities
            },
            "message": "Dashboard stats retrieved successfully",
            "statusCode": 200
        }
    )
