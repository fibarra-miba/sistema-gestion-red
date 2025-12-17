from fastapi import APIRouter, HTTPException, Query, Path
from typing import List
from app.schemas.cliente import ClienteOut, ClienteCreate
from app.repositories.clientes_repo import (
    list_clientes,
    get_cliente_by_id,
    create_cliente
)
from psycopg.errors import UniqueViolation

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.get("", response_model=List[ClienteOut])
def get_clientes(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    try:
        return list_clientes(limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clientes: {str(e)}")


@router.get("/{cliente_id}", response_model=ClienteOut)
def get_cliente(
    cliente_id: int = Path(..., ge=1),
):
    try:
        cliente = get_cliente_by_id(cliente_id)
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente not found")
        return cliente
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cliente: {str(e)}")

@router.post("", response_model=ClienteOut, status_code=201)
def create_cliente_endpoint(cliente: ClienteCreate):
    try:
        return create_cliente(cliente.dict())
    except UniqueViolation:
        raise HTTPException(
            status_code=409,
            detail="Cliente with this DNI already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating cliente: {str(e)}"
        )

