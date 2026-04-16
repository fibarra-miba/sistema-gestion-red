import pytest


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


@pytest.mark.anyio
async def test_no_double_active_contract(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    r1 = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r1.status_code == 200, r1.text
    id1 = r1.json()["contrato_id"]

    r1a = await client.post(f"/contratos/{id1}/activate")
    assert r1a.status_code == 200, r1a.text

    r2 = await client.post(
        "/contratos",
        json={"cliente_id": 1, "domicilio_id": domicilio_id, "plan_id": 1},
    )
    assert r2.status_code == 200, r2.text
    id2 = r2.json()["contrato_id"]

    response = await client.post(f"/contratos/{id2}/activate")

    assert response.status_code == 400, response.text


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


@pytest.mark.anyio
async def test_list_contracts_global(client):
    response = await client.get("/contratos")

    assert response.status_code == 200, response.text
    data = response.json()

    assert "items" in data
    assert len(data["items"]) >= 2
    assert "cliente_nombre" in data["items"][0]
    assert "plan_nombre" in data["items"][0]
    assert "estado_contrato_descripcion" in data["items"][0]


@pytest.mark.anyio
async def test_list_contracts_filtered_by_cliente(client):
    response = await client.get("/contratos", params={"cliente_id": 1})

    assert response.status_code == 200, response.text
    data = response.json()

    assert len(data["items"]) >= 1
    assert all(item["cliente_id"] == 1 for item in data["items"])


@pytest.mark.anyio
async def test_create_contract_fails_if_domicilio_not_belongs_to_cliente(client, db_conn):
    domicilio_id_cliente_2 = _get_domicilio_id_seed(db_conn, 2)

    response = await client.post(
        "/contratos",
        json={
            "cliente_id": 1,
            "domicilio_id": domicilio_id_cliente_2,
            "plan_id": 1,
        },
    )

    assert response.status_code == 400, response.text
    assert response.json()["detail"] == "El domicilio no pertenece al cliente informado."


@pytest.mark.anyio
async def test_create_contract_fails_if_plan_inactivo(client, db_conn):
    with db_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO planes (nombre_plan, velocidad_mbps_plan, estado_plan_id, descripcion_plan)
            VALUES ('Plan Inactivo Test', 99, 2, 'Plan inactivo para testing')
            RETURNING plan_id
            """
        )
        row = cur.fetchone()
        assert row is not None
        plan_id_inactivo = int(row[0])

    db_conn.commit()

    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    response = await client.post(
        "/contratos",
        json={
            "cliente_id": 1,
            "domicilio_id": domicilio_id,
            "plan_id": plan_id_inactivo,
        },
    )

    assert response.status_code == 400, response.text
    assert response.json()["detail"] == "El plan informado no está activo."


@pytest.mark.anyio
async def test_get_contract_detail_commercial(client, db_conn):
    domicilio_id = _get_domicilio_id_seed(db_conn, 1)

    create_response = await client.post(
        "/contratos",
        json={
            "cliente_id": 1,
            "domicilio_id": domicilio_id,
            "plan_id": 1,
        },
    )
    assert create_response.status_code == 200, create_response.text
    contrato_id = create_response.json()["contrato_id"]

    response = await client.get(f"/contratos/{contrato_id}")

    assert response.status_code == 200, response.text
    data = response.json()

    assert data["contrato_id"] == contrato_id
    assert data["cliente_nombre"] == "Cliente"
    assert data["cliente_apellido"] in ("Testing", "PagosSeed")
    assert data["plan_nombre"] == "Plan Básico"
    assert data["estado_contrato_descripcion"] == "BORRADOR"
