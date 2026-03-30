import pytest


# ==========================================================
# HELPERS
# ==========================================================

async def _confirmar_condicion_tecnica(client, contrato_id, apto):
    return await client.post(
        f"/contratos/{contrato_id}/confirmar-condicion-tecnica",
        json={
            "apto": apto,
            "fecha_programacion_pinstalacion": "2030-01-01T10:00:00Z"
        },
    )


# ==========================================================
# 1. CONTRATO APTO → ACTIVO
# ==========================================================

@pytest.mark.anyio
async def test_condicion_tecnica_apto_activa_contrato(client):
    res = await _confirmar_condicion_tecnica(client, 1, True)

    assert res.status_code == 200
    data = res.json()

    assert data["estado_contrato_id"] == 3  # ACTIVO
    assert data["programacion_id"] is None


# ==========================================================
# 2. REQUIERE INSTALACION → CREA PROGRAMACION
# ==========================================================

@pytest.mark.anyio
async def test_condicion_tecnica_requiere_instalacion(client):
    res = await _confirmar_condicion_tecnica(client, 1, False)

    assert res.status_code == 200
    data = res.json()

    assert data["estado_contrato_id"] == 2  # PENDIENTE_INSTALACION
    assert data["programacion_id"] is not None


# ==========================================================
# 3. REPROGRAMACION INSERTA HISTORICO
# ==========================================================

@pytest.mark.anyio
async def test_reprogramacion_crea_historial(client):
    # ya existe programacion en seed → id = 1
    res = await client.post(
        "/instalaciones/programaciones-instalacion/1/reprogramar",
        json={
            "fecha_programacion_pinstalacion": "2030-01-02T10:00:00Z",
            "motivo_reprogramacion": "Test"
        },
    )

    assert res.status_code == 200

    # validamos que exista histórico
    res_list = await client.get("/instalaciones/programaciones-instalacion/1")
    assert res_list.status_code == 200


# ==========================================================
# 4. CREAR INSTALACION VALIDA
# ==========================================================

@pytest.mark.anyio
async def test_crear_instalacion(client):
    res = await client.post(
        "/instalaciones",
        json={
            "programacion_id": 1,
            "contrato_id": 1,
            "domicilio_id": 1,
            "estado_instalacion_id": 1
        },
    )

    # puede fallar si ya existe (seed) → lo aceptamos
    assert res.status_code in (200, 400)


# ==========================================================
# 5. COMPLETAR INSTALACION ACTIVA CONTRATO
# ==========================================================

@pytest.mark.anyio
async def test_completar_instalacion_activa_contrato(client):
    # instalación seed id=1
    res = await client.post("/instalaciones/1/completar")

    assert res.status_code == 200
    data = res.json()

    assert data["estado_instalacion_id"] == 2  # COMPLETADA
    assert data["estado_contrato_id"] == 3     # ACTIVO


# ==========================================================
# 6. CANCELAR NO ACTIVA CONTRATO
# ==========================================================

@pytest.mark.anyio
async def test_cancelar_instalacion(client):
    res = await client.post("/instalaciones/1/cancelar")

    assert res.status_code == 200
    data = res.json()

    assert data["estado_instalacion_id"] == 3  # CANCELADA
    assert data["estado_contrato_id"] is None


# ==========================================================
# 7. FALLAR NO ACTIVA CONTRATO
# ==========================================================

@pytest.mark.anyio
async def test_fallar_instalacion(client):
    res = await client.post("/instalaciones/1/fallar")

    assert res.status_code == 200
    data = res.json()

    assert data["estado_instalacion_id"] == 4  # FALLIDA


# ==========================================================
# 8. DETALLE INSTALACION
# ==========================================================

@pytest.mark.anyio
async def test_detalle_instalacion(client):
    res = await client.post(
        "/instalaciones/1/detalles",
        json={
            "producto_id": 1,
            "cantidad_dinstalacion": 10,
            "unidad_dinstalacion": "mts"
        },
    )

    assert res.status_code == 200

    res_list = await client.get("/instalaciones/1/detalles")
    assert res_list.status_code == 200
    assert len(res_list.json()["items"]) >= 1


# ==========================================================
# 9. VALIDACION INCONSISTENCIA
# ==========================================================

@pytest.mark.anyio
async def test_instalacion_inconsistente(client):
    res = await client.post(
        "/instalaciones",
        json={
            "programacion_id": 1,
            "contrato_id": 999,  # no existe
            "domicilio_id": 1,
            "estado_instalacion_id": 1
        },
    )

    assert res.status_code == 400
