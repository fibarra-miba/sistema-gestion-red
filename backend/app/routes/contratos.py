# app/routes/contratos.py

from fastapi import APIRouter, Depends, HTTPException, Query
from psycopg import Connection

from app.db import get_db
from app.repositories.contrato_repo import ContractRepository
from app.services.contratos_service import ContractService
from app.schemas.contrato import (
    ContractCreate,
    ContractResponse,
    ContractListResponse,
    ContractChangePlan,
)

router = APIRouter(prefix="/contratos", tags=["Contratos"])


# ==========================================================
# Dependency builder
# ==========================================================

def get_service(conn: Connection = Depends(get_db)) -> ContractService:
    repo = ContractRepository(conn)
    return ContractService(repo)


# ==========================================================
# CREATE
# ==========================================================

@router.post("", response_model=ContractResponse)
def create_contract(
    payload: ContractCreate,
    service: ContractService = Depends(get_service),
):
    try:
        contract = service.create_contract(
            cliente_id=payload.cliente_id,
            plan_id=payload.plan_id,
        )
        return contract
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# GET BY ID
# ==========================================================

@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: int,
    service: ContractService = Depends(get_service),
):
    try:
        return service.get_contract(contract_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ==========================================================
# LIST BY CLIENTE
# ==========================================================

@router.get("", response_model=ContractListResponse)
def list_contracts(
    cliente_id: int = Query(...),
    service: ContractService = Depends(get_service),
):
    contracts = service.list_by_cliente(cliente_id)
    return {"items": contracts}


# ==========================================================
# ACTIVATE
# ==========================================================

@router.post("/{contract_id}/activate")
def activate_contract(
    contract_id: int,
    service: ContractService = Depends(get_service),
):
    try:
        service.activate(contract_id)
        return {"message": "Contrato activado."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# SUSPEND
# ==========================================================

@router.post("/{contract_id}/suspend")
def suspend_contract(
    contract_id: int,
    service: ContractService = Depends(get_service),
):
    try:
        service.suspend(contract_id)
        return {"message": "Contrato suspendido."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# RESUME
# ==========================================================

@router.post("/{contract_id}/resume")
def resume_contract(
    contract_id: int,
    service: ContractService = Depends(get_service),
):
    try:
        service.resume(contract_id)
        return {"message": "Contrato reanudado."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# CANCEL
# ==========================================================

@router.post("/{contract_id}/cancel")
def cancel_contract(
    contract_id: int,
    service: ContractService = Depends(get_service),
):
    try:
        service.cancel(contract_id)
        return {"message": "Contrato cancelado."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# TERMINATE (BAJA)
# ==========================================================

@router.post("/{contract_id}/terminate")
def terminate_contract(
    contract_id: int,
    service: ContractService = Depends(get_service),
):
    try:
        service.terminate(contract_id)
        return {"message": "Contrato dado de baja."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================================
# CHANGE PLAN
# ==========================================================

@router.post("/{contract_id}/change-plan", response_model=ContractResponse)
def change_plan(
    contract_id: int,
    payload: ContractChangePlan,
    service: ContractService = Depends(get_service),
):
    try:
        new_contract = service.change_plan(
            contrato_id=contract_id,
            new_plan_id=payload.new_plan_id,
        )
        return new_contract
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))