from pydantic import BaseModel, Field
from typing import Optional, List
import datetime

class ClassCreate(BaseModel):
    department: str = Field(..., min_length=2, max_length=100)
    courseCode: str = Field(..., min_length=2, max_length=50)
    courseTitle: str = Field(..., min_length=2, max_length=150)
    instructorName: str = Field(..., min_length=2, max_length=100)
    semester: str = Field(..., min_length=2, max_length=50)
    buildingName: str = Field(..., min_length=1, max_length=100)
    roomNumber: str = Field(..., min_length=1, max_length=50)
    startTime: str = Field(..., min_length=2, max_length=20)
    endTime: str = Field(..., min_length=2, max_length=20)
    days: List[str] = Field(default_factory=list, description="Class days e.g. Saturday, Sunday, Monday...")
    status: Optional[str] = Field("upcoming", description="Class status: running, end, or upcoming")

class ClassUpdate(BaseModel):
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    courseCode: Optional[str] = Field(None, min_length=2, max_length=50)
    courseTitle: Optional[str] = Field(None, min_length=2, max_length=150)
    instructorName: Optional[str] = Field(None, min_length=2, max_length=100)
    semester: Optional[str] = Field(None, min_length=2, max_length=50)
    buildingName: Optional[str] = Field(None, min_length=1, max_length=100)
    roomNumber: Optional[str] = Field(None, min_length=1, max_length=50)
    startTime: Optional[str] = Field(None, min_length=2, max_length=20)
    endTime: Optional[str] = Field(None, min_length=2, max_length=20)
    days: Optional[List[str]] = Field(None, description="Class days e.g. Saturday, Sunday, Monday...")
    status: Optional[str] = Field(None, description="Class status: running, end, or upcoming")

class ClassResponse(BaseModel):
    id: str
    department: str
    courseCode: str
    courseTitle: str
    instructorName: str
    semester: str
    buildingName: str
    roomNumber: str
    startTime: str
    endTime: str
    days: List[str] = Field(default_factory=list)
    status: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
