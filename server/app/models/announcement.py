from pydantic import BaseModel, Field
from typing import Optional
import datetime

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    content: str = Field(..., min_length=2, max_length=2000)
    priority: str = Field("medium", description="Priority level: high, medium, low")
    category: Optional[str] = Field("General", max_length=100)
    imageUrl: Optional[str] = Field(None, description="Cloudinary image URL")

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    content: Optional[str] = Field(None, min_length=2, max_length=2000)
    priority: Optional[str] = Field(None, description="Priority level: high, medium, low")
    category: Optional[str] = Field(None, max_length=100)
    imageUrl: Optional[str] = Field(None, description="Cloudinary image URL")

class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    priority: str
    category: Optional[str] = "General"
    imageUrl: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
