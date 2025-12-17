from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ClienteOut(BaseModel):
    cliente_id: int
    nombre: str
    apellido: str
    dni: str
    telefono: str
    email: Optional[EmailStr] = None
    fecha_alta: Optional[datetime] = None
    estado_cliente_id: int
    observaciones: Optional[str] = None

class ClienteCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50)
    apellido: str = Field(..., min_length=1, max_length=50)
    dni: str = Field(..., min_length=5, max_length=20)
    telefono: str = Field(..., min_length=5, max_length=20)
    email: Optional[EmailStr] = None
    estado_cliente_id: int = Field(..., ge=1)
    observaciones: Optional[str] = Field(None, max_length=100)

