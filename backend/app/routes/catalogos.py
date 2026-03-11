from __future__ import annotations

from fastapi import APIRouter, Depends
from psycopg import Connection

from app.repositories.catalogos_repo import CatalogosRepo
from app.schemas.catalogo import CatalogoItemOut

# ajustá este import a tu proyecto
from app.db import get_db


router = APIRouter(prefix="/catalogos", tags=["Catalogos"])


@router.get("/medios-pagos", response_model=list[CatalogoItemOut])
def medios_pagos(conn: Connection = Depends(get_db)):
    repo = CatalogosRepo(conn)
    return repo.list_medios_pagos()


@router.get("/tipos-promo", response_model=list[CatalogoItemOut])
def tipos_promo(conn: Connection = Depends(get_db)):
    repo = CatalogosRepo(conn)
    return repo.list_tipos_promo()


@router.get("/tipos-pago", response_model=list[CatalogoItemOut])
def tipos_pago(conn: Connection = Depends(get_db)):
    repo = CatalogosRepo(conn)
    return repo.list_tipos_pago()


@router.get("/estados-pago", response_model=list[CatalogoItemOut])
def estados_pago(conn: Connection = Depends(get_db)):
    repo = CatalogosRepo(conn)
    return repo.list_estados_pago()