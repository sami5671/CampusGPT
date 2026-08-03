from pydantic import BaseModel, Field
from typing import Optional
import datetime

class TemplateCreate(BaseModel):
    templateName: str = Field(..., min_length=2, max_length=100)
    imageUrl: str = Field(..., min_length=5, max_length=1000)
    description: Optional[str] = Field("", max_length=500)

class TemplateUpdate(BaseModel):
    templateName: Optional[str] = Field(None, min_length=2, max_length=100)
    imageUrl: Optional[str] = Field(None, min_length=5, max_length=1000)
    description: Optional[str] = Field(None, max_length=500)

class TemplateResponse(BaseModel):
    id: str
    templateName: str
    imageUrl: str
    description: Optional[str] = ""
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
