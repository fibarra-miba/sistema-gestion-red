import pytest


# ==========================================================
# CREATE PLAN
# ==========================================================

@pytest.mark.anyio
async def test_create_plan(client):
    payload = {
        "nombre_plan": "Plan Test 100 Mbps",
        "velocidad_mbps_plan": 100,
        "descripcion_plan": "Plan de prueba",
        "estado_plan_id": 1
    }

    response = await client.post("/planes", json=payload)

    assert response.status_code == 200, response.text
    data = response.json()

    assert data["nombre_plan"] == payload["nombre_plan"]
    assert data["velocidad_mbps_plan"] == payload["velocidad_mbps_plan"]
    assert data["descripcion_plan"] == payload["descripcion_plan"]
    assert data["estado_plan_id"] == payload["estado_plan_id"]


# ==========================================================
# GET PLAN BY ID
# ==========================================================

@pytest.mark.anyio
async def test_get_plan_by_id(client):
    payload = {
        "nombre_plan": "Plan Consulta",
        "velocidad_mbps_plan": 50,
        "descripcion_plan": "Plan para consulta",
        "estado_plan_id": 1
    }

    create_response = await client.post("/planes", json=payload)
    assert create_response.status_code == 200, create_response.text
    plan_id = create_response.json()["plan_id"]

    response = await client.get(f"/planes/{plan_id}")

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["plan_id"] == plan_id


# ==========================================================
# LIST PLANS
# ==========================================================

@pytest.mark.anyio
async def test_list_planes(client):
    response = await client.get("/planes")

    assert response.status_code == 200, response.text
    data = response.json()

    assert "items" in data
    assert isinstance(data["items"], list)


# ==========================================================
# UPDATE PLAN
# ==========================================================

@pytest.mark.anyio
async def test_update_plan(client):
    payload = {
        "nombre_plan": "Plan Editable",
        "velocidad_mbps_plan": 30,
        "descripcion_plan": "Antes de editar",
        "estado_plan_id": 1
    }

    create_response = await client.post("/planes", json=payload)
    assert create_response.status_code == 200, create_response.text
    plan_id = create_response.json()["plan_id"]

    update_payload = {
        "nombre_plan": "Plan Editado",
        "velocidad_mbps_plan": 60
    }

    response = await client.patch(f"/planes/{plan_id}", json=update_payload)

    assert response.status_code == 200, response.text
    data = response.json()

    assert data["nombre_plan"] == "Plan Editado"
    assert data["velocidad_mbps_plan"] == 60


# ==========================================================
# DELETE PLAN (LOGICAL DELETE)
# ==========================================================

@pytest.mark.anyio
async def test_delete_plan(client):
    payload = {
        "nombre_plan": "Plan Eliminable",
        "velocidad_mbps_plan": 25,
        "descripcion_plan": "Plan a eliminar",
        "estado_plan_id": 1
    }

    create_response = await client.post("/planes", json=payload)
    assert create_response.status_code == 200, create_response.text
    plan_id = create_response.json()["plan_id"]

    delete_response = await client.delete(f"/planes/{plan_id}")

    assert delete_response.status_code == 200, delete_response.text
    assert delete_response.json()["message"] == "Plan desactivado correctamente."

    # Verificar que el plan sigue existiendo pero inactivo
    get_response = await client.get(f"/planes/{plan_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["estado_plan_id"] == 2


# ==========================================================
# UNIQUE PLAN NAME
# ==========================================================

@pytest.mark.anyio
async def test_unique_plan_name(client):
    payload = {
        "nombre_plan": "Plan Único",
        "velocidad_mbps_plan": 80,
        "descripcion_plan": "Primer registro",
        "estado_plan_id": 1
    }

    response_1 = await client.post("/planes", json=payload)
    assert response_1.status_code == 200, response_1.text

    response_2 = await client.post("/planes", json=payload)

    assert response_2.status_code == 400
    assert "Ya existe un plan con ese nombre" in response_2.json()["detail"]
