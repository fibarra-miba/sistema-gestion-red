# app/schemas/contract.py

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# ==========================================================
# ENUM
# ==========================================================

class ContractStatus(str, Enum):
    BORRADOR = "BORRADOR"
    PENDIENTE_INSTALACION = "PENDIENTE_INSTALACION"
    ACTIVO = "ACTIVO"
    SUSPENDIDO = "SUSPENDIDO"
    BAJA = "BAJA"
    CANCELADO = "CANCELADO"


# ==========================================================
# CREATE
# ==========================================================

class ContractCreate(BaseModel):
    cliente_id: int
    plan_id: int


# ==========================================================
# RESPONSE
# ==========================================================

class ContractResponse(BaseModel):
    contrato_id: int
    cliente_id: int
    plan_id: int
    fecha_inicio_contrato: datetime
    fecha_fin_contrato: Optional[datetime]
    estado_contrato_id: int

    class Config:
        from_attributes = True


# ==========================================================
# LIST
# ==========================================================

class ContractListResponse(BaseModel):
    items: List[ContractResponse]


# ==========================================================
# ACTION SCHEMAS
# ==========================================================

class ContractSuspend(BaseModel):
    motivo: Optional[str] = Field(None, max_length=200)


class ContractTerminate(BaseModel):
    motivo: Optional[str] = Field(None, max_length=200)


class ContractChangePlan(BaseModel):
    new_plan_id: int