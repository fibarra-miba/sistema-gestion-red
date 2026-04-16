from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, Field


# ==========================================================
# CREATE
# ==========================================================

class PlanCreate(BaseModel):
    nombre_plan: str = Field(..., min_length=3, max_length=50)
    velocidad_mbps_plan: int = Field(..., gt=0)
    descripcion_plan: Optional[str] = Field(None, max_length=100)
    estado_plan_id: int = Field(..., ge=1)


# ==========================================================
# UPDATE
# ==========================================================

class PlanUpdate(BaseModel):
    nombre_plan: Optional[str] = Field(None, min_length=3, max_length=50)
    velocidad_mbps_plan: Optional[int] = Field(None, gt=0)
    descripcion_plan: Optional[str] = Field(None, max_length=100)
    estado_plan_id: Optional[int] = Field(None, ge=1)


# ==========================================================
# RESPONSE
# ==========================================================

class PlanResponse(BaseModel):
    plan_id: int
    nombre_plan: str
    velocidad_mbps_plan: int
    descripcion_plan: Optional[str]
    estado_plan_id: int

    class Config:
        from_attributes = True


# ==========================================================
# LIST RESPONSE
# ==========================================================

class PlanListResponse(BaseModel):
    items: List[PlanResponse]


# ==========================================================
# COMMERCIAL VIEW (opcional para frontend)
# ==========================================================

class PlanComercialResponse(BaseModel):
    plan_id: int
    nombre_plan: str
    velocidad_mbps_plan: int
    descripcion_plan: Optional[str]
    precio_vigente: Optional[float] = None
    estado_plan_id: int