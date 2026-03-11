# tests/test_contracts.py

import pytest
from httpx import AsyncClient


def _get_domicilio_id_seed(db_conn, cliente_id: int) -> int:
    with db_conn.cursor() as cur:
        cur.execute(
            """
            SELECT domicilio_id
              FROM domicilios
             WHERE cliente_id = %s
             ORDER BY domicilio_id ASC
             LIMIT 1
            """,
            (cliente_id,),
        )
        row = cur.fetchone()
        assert row is not None, f"No existe domicilio seed para cliente_id={cliente_id}"
        return int(row[0])


# ==========================================================
# CREATE CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_create_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    payload = {
        "cliente_id": 1,
        "domicilio_id": domicilio_id,
        "plan_id": 1,
    }

    response = await client.post("/contratos", json=payload)

    assert response.status_code == 200, response.text
    data = response.json()

    assert data["cliente_id"] == 1
    assert data["domicilio_id"] == domicilio_id
    assert data["plan_id"] == 1
    assert data["estado_contrato_id"] == 1  # BORRADOR


# ==========================================================
# ACTIVATE CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_activate_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    payload = {
        "cliente_id": 1,
        "domicilio_id": domicilio_id,
        "plan_id": 1,
    }
    response = await client.post("/contratos", json=payload)
    assert response.status_code == 200, response.text
    contrato_id = response.json()["contrato_id"]

    response = await client.post(f"/contratos/{contrato_id}/activate")

    assert response.status_code == 200, response.text


# ==========================================================
# NO DOUBLE ACTIVE
# ==========================================================

@pytest.mark.anyio
async def test_no_double_active_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    # Primer contrato
    r1 = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r1.status_code == 200, r1.text
    id1 = r1.json()["contrato_id"]

    r1a = await client.post(f"/contratos/{id1}/activate")
    assert r1a.status_code == 200, r1a.text

    # Segundo contrato, mismo domicilio
    r2 = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r2.status_code == 200, r2.text
    id2 = r2.json()["contrato_id"]

    # Intentar activar segundo => debe fallar por mismo domicilio activo/vigente
    response = await client.post(f"/contratos/{id2}/activate")

    assert response.status_code == 400, response.text


# ==========================================================
# SUSPEND CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_suspend_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    r = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r.status_code == 200, r.text
    contrato_id = r.json()["contrato_id"]

    r_act = await client.post(f"/contratos/{contrato_id}/activate")
    assert r_act.status_code == 200, r_act.text

    response = await client.post(f"/contratos/{contrato_id}/suspend")

    assert response.status_code == 200, response.text


# ==========================================================
# RESUME CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_resume_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    r = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r.status_code == 200, r.text
    contrato_id = r.json()["contrato_id"]

    r_act = await client.post(f"/contratos/{contrato_id}/activate")
    assert r_act.status_code == 200, r_act.text

    r_sus = await client.post(f"/contratos/{contrato_id}/suspend")
    assert r_sus.status_code == 200, r_sus.text

    response = await client.post(f"/contratos/{contrato_id}/resume")

    assert response.status_code == 200, response.text


# ==========================================================
# CANCEL CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_cancel_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    r = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r.status_code == 200, r.text
    contrato_id = r.json()["contrato_id"]

    response = await client.post(f"/contratos/{contrato_id}/cancel")

    assert response.status_code == 200, response.text


# ==========================================================
# TERMINATE CONTRACT
# ==========================================================

@pytest.mark.anyio
async def test_terminate_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    r = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r.status_code == 200, r.text
    contrato_id = r.json()["contrato_id"]

    r_act = await client.post(f"/contratos/{contrato_id}/activate")
    assert r_act.status_code == 200, r_act.text

    response = await client.post(f"/contratos/{contrato_id}/terminate")

    assert response.status_code == 200, response.text


# ==========================================================
# CHANGE PLAN
# ==========================================================

@pytest.mark.anyio
async def test_change_plan(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    r = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r.status_code == 200, r.text
    contrato_id = r.json()["contrato_id"]

    r_act = await client.post(f"/contratos/{contrato_id}/activate")
    assert r_act.status_code == 200, r_act.text

    response = await client.post(
        f"/contratos/{contrato_id}/change-plan",
        json={"new_plan_id": 2}
    )

    assert response.status_code == 200, response.text
    new_contract = response.json()

    assert new_contract["plan_id"] == 2
    assert new_contract["domicilio_id"] == domicilio_id
