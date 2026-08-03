from pydantic import BaseModel, Field
from typing import Optional
import datetime

class OfficeCreate(BaseModel):
    officeName: str = Field(..., min_length=2, max_length=100)
    building: str = Field(..., min_length=1, max_length=100)
    floor: str = Field(..., min_length=1, max_length=50)
    room: str = Field(..., min_length=1, max_length=50)
    phoneNumber: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    officeHours: str = Field(..., min_length=2, max_length=100)
    mapLink: Optional[str] = Field("", max_length=500)

class OfficeUpdate(BaseModel):
    officeName: Optional[str] = Field(None, min_length=2, max_length=100)
    building: Optional[str] = Field(None, min_length=1, max_length=100)
    floor: Optional[str] = Field(None, min_length=1, max_length=50)
    room: Optional[str] = Field(None, min_length=1, max_length=50)
    phoneNumber: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[str] = Field(None, min_length=5, max_length=100)
    officeHours: Optional[str] = Field(None, min_length=2, max_length=100)
    mapLink: Optional[str] = Field(None, max_length=500)

class OfficeResponse(BaseModel):
    id: str
    officeName: str
    building: str
    floor: str
    room: str
    phoneNumber: str
    email: str
    officeHours: str
    mapLink: Optional[str] = ""
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
