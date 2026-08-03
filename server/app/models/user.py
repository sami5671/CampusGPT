from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
import datetime

class UserRoleEnum(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    STAFF = "staff"
    ADMIN = "admin"

class UserRegister(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="University email address")
    idNumber: str = Field(..., description="Student / Faculty / Staff ID")
    department: Optional[str] = "Computer Science & Engineering"
    role: UserRoleEnum = UserRoleEnum.STUDENT
    password: str = Field(..., min_length=6, max_length=128)

class UserLogin(BaseModel):
    email: str
    password: str
    role: Optional[UserRoleEnum] = None

class UserResponse(BaseModel):
    id: str
    fullName: str
    email: str
    idNumber: str
    department: Optional[str] = None
    role: str
    createdAt: Optional[str] = None

class ApiResponseModel(BaseModel):
    status: bool
    data: Optional[dict] = None
    message: str
    statusCode: int = 200
