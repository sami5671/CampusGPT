from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import datetime

class FacultyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    department: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    officeRoom: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    contactNumber: str = Field(..., min_length=3, max_length=50)
    officeHours: str = Field(..., min_length=2, max_length=100)

class FacultyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    designation: Optional[str] = Field(None, min_length=2, max_length=100)
    officeRoom: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, min_length=5, max_length=100)
    contactNumber: Optional[str] = Field(None, min_length=3, max_length=50)
    officeHours: Optional[str] = Field(None, min_length=2, max_length=100)

class FacultyResponse(BaseModel):
    id: str
    name: str
    department: str
    designation: str
    officeRoom: str
    email: str
    contactNumber: str
    officeHours: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
