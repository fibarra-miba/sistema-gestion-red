from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection

from app.db import get_db
from app.repositories.planes_repo import PlanesRepository
from app.services.planes_service import PlanesService
from app.schemas.plan import (
    PlanCreate,
    PlanUpdate,
    PlanResponse,
    PlanListResponse,
)

router = APIRouter(prefix="/planes", tags=["Planes"])


def get_service(conn: Connection = Depends(get_db)) -> PlanesService:
    repo = PlanesRepository(conn)
    return PlanesService(repo)


# ==========================================================
# CREATE
# ==========================================================

@router.post("", response_model=PlanResponse)
def create_plan(
    payload: PlanCreate,
    service: PlanesService = Depends(get_service),
):
    try:
        return service.create_plan(**payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# READ
# ==========================================================

@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan(
    plan_id: int,
    service: PlanesService = Depends(get_service),
):
    try:
        return service.get_plan(plan_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("", response_model=PlanListResponse)
def list_planes(service: PlanesService = Depends(get_service)):
    return {"items": service.list_planes()}


# ==========================================================
# UPDATE
# ==========================================================

@router.patch("/{plan_id}", response_model=PlanResponse)
def update_plan(
    plan_id: int,
    payload: PlanUpdate,
    service: PlanesService = Depends(get_service),
):
    try:
        data = payload.model_dump(exclude_unset=True)
        return service.update_plan(plan_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# DELETE (LÓGICO)
# ==========================================================

@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    service: PlanesService = Depends(get_service),
):
    try:
        service.delete_plan(plan_id)
        return {"message": "Plan desactivado correctamente."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))