# tests/test_contracts.py

import pytest
from httpx import AsyncClient


# ==========================================================
# CREATE CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_create_contract(client):

    payload = {
        "cliente_id": 1,
        "plan_id": 1
    }

    response = await client.post("/contratos", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["cliente_id"] == 1
    assert data["plan_id"] == 1
    assert data["estado_contrato_id"] == 1  # BORRADOR


# ==========================================================
# ACTIVATE CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_activate_contract(client):

    # Crear primero
    payload = {"cliente_id": 1, "plan_id": 1}
    response = await client.post("/contratos", json=payload)
    contrato_id = response.json()["contrato_id"]

    # Activar
    response = await client.post(f"/contratos/{contrato_id}/activate")

    assert response.status_code == 200


# ==========================================================
# NO DOUBLE ACTIVE
# ==========================================================

@pytest.mark.anyio
async def test_no_double_active_contract(client):

    # Primer contrato
    r1 = await client.post("/contratos", json={"cliente_id": 1, "plan_id": 1})
    id1 = r1.json()["contrato_id"]
    await client.post(f"/contratos/{id1}/activate")

    # Segundo contrato
    r2 = await client.post("/contratos", json={"cliente_id": 1, "plan_id": 1})
    id2 = r2.json()["contrato_id"]

    # Intentar activar segundo
    response = await client.post(f"/contratos/{id2}/activate")

    assert response.status_code == 400


# ==========================================================
# SUSPEND CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_suspend_contract(client):

    r = await client.post("/contratos", json={"cliente_id": 1, "plan_id": 1})
    contrato_id = r.json()["contrato_id"]
    await client.post(f"/contratos/{contrato_id}/activate")

    response = await client.post(f"/contratos/{contrato_id}/suspend")

    assert response.status_code == 200


# ==========================================================
# RESUME CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_resume_contract(client):

    r = await client.post("/contratos", json={"cliente_id": 1, "plan_id": 1})
    contrato_id = r.json()["contrato_id"]

    await client.post(f"/contratos/{contrato_id}/activate")
    await client.post(f"/contratos/{contrato_id}/suspend")

    response = await client.post(f"/contratos/{contrato_id}/resume")

    assert response.status_code == 200


# ==========================================================
# CANCEL CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_cancel_contract(client):

    r = await client.post("/contratos", json={"cliente_id": 1, "plan_id": 1})
    contrato_id = r.json()["contrato_id"]

    response = await client.post(f"/contratos/{contrato_id}/cancel")

    assert response.status_code == 200


# ==========================================================
# TERMINATE CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_terminate_contract(client):

    r = await client.post("/contratos", json={"cliente_id": 1, "plan_id": 1})
    contrato_id = r.json()["contrato_id"]

    await client.post(f"/contratos/{contrato_id}/activate")

    response = await client.post(f"/contratos/{contrato_id}/terminate")

    assert response.status_code == 200


# ==========================================================
# CHANGE PLAN
# ==========================================================

@pytest.mark.anyio
async def test_change_plan(client):

    r = await client.post("/contratos", json={"cliente_id": 1, "plan_id": 1})
    contrato_id = r.json()["contrato_id"]

    await client.post(f"/contratos/{contrato_id}/activate")

    response = await client.post(
        f"/contratos/{contrato_id}/change-plan",
        json={"new_plan_id": 2}
    )

    assert response.status_code == 200
    new_contract = response.json()

    assert new_contract["plan_id"] == 2