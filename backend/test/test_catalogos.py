from __future__ import annotations

import pytest


@pytest.mark.anyio
async def test_catalogos_medios_pagos(client):
    r = await client.get("/catalogos/medios-pagos")
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1


@pytest.mark.anyio
async def test_catalogos_tipos_promo(client):
    r = await client.get("/catalogos/tipos-promo")
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    # sanity: debe incluir PORCENTAJE y/o DESCUENTO_FIJO si tu seed los crea
    descs = {str(x.get("descripcion_tpromo", "")).upper() for x in data}
    assert ("PORCENTAJE" in descs) or ("DESCUENTO_FIJO" in descs)


@pytest.mark.anyio
async def test_catalogos_tipos_pago(client):
    r = await client.get("/catalogos/tipos-pago")
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1


@pytest.mark.anyio
async def test_catalogos_estados_pago(client):
    r = await client.get("/catalogos/estados-pago")
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    # sanity: debe incluir PENDIENTE / PARCIAL / PAGADO si el seed está completo
    descs = {str(x.get("descripcion_epago", "")).upper() for x in data}
    assert {"PENDIENTE", "PARCIAL", "PAGADO"}.issubset(descs)
