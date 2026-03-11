from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

import pytest


def _get_contrato_activo_y_cliente(db_conn) -> tuple[int, int]:
    with db_conn.cursor() as cur:
        cur.execute(
            """
            SELECT contrato_id, cliente_id
              FROM contratos
             WHERE estado_contrato_id = 3
             ORDER BY contrato_id ASC
             LIMIT 1
            """
        )
        row = cur.fetchone()
        assert row is not None, "Seed: falta al menos 1 contrato ACTIVO (estado_contrato_id=3)"
        return int(row[0]), int(row[1])


def _get_medio_pago_id(db_conn) -> int:
    with db_conn.cursor() as cur:
        cur.execute("SELECT medio_pago_id FROM medios_pagos ORDER BY medio_pago_id ASC LIMIT 1")
        row = cur.fetchone()
        assert row is not None, "Seed: falta al menos 1 medio de pago"
        return int(row[0])


def _get_tipo_pago_id(db_conn) -> int:
    with db_conn.cursor() as cur:
        cur.execute("SELECT tipo_pago_id FROM tipo_pago ORDER BY tipo_pago_id ASC LIMIT 1")
        row = cur.fetchone()
        assert row is not None, "Seed: falta al menos 1 tipo de pago"
        return int(row[0])


async def _generar_pago_periodo(client, contrato_id: int, periodo_anio_pago: int, periodo_mes_pago: int, bonificacion=0):
    body = {
        "periodo_anio_pago": periodo_anio_pago,
        "periodo_mes_pago": periodo_mes_pago,
        "fecha_emision": str(date.today()),
        "fecha_vencimiento": None,
        "bonificacion_previa": bonificacion,
    }
    r = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r.status_code == 200, r.text
    return r.json()["pago"]


async def _registrar_mov(client, pago_id: int, monto: Decimal, medio_pago_id: int, tipo_pago_id: int, comps=None):
    body = {
        "fecha_pago": datetime.utcnow().isoformat(),
        "monto_pago": str(monto),
        "medio_pago_id": medio_pago_id,
        "tipo_pago_id": tipo_pago_id,
        "observacion": "mov test",
        "comprobantes": comps or [],
    }
    r = await client.post(f"/pagos/{pago_id}/movimientos", json=body)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.mark.anyio
async def test_get_pago_detalle_y_movimientos_y_movimiento_404(client, db_conn):
    contrato_id, _ = _get_contrato_activo_y_cliente(db_conn)
    medio_pago_id = _get_medio_pago_id(db_conn)
    tipo_pago_id = _get_tipo_pago_id(db_conn)

    today = date.today()
    pago = await _generar_pago_periodo(client, contrato_id, today.year, today.month, bonificacion=0)
    pago_id = int(pago["pago_id"])
    total_factura = Decimal(str(pago["total_factura"]))
    assert total_factura > 0

    det = await _registrar_mov(
        client,
        pago_id,
        monto=(total_factura / 4).quantize(Decimal("0.01")),
        medio_pago_id=medio_pago_id,
        tipo_pago_id=tipo_pago_id,
        comps=[
            {"url": "https://files.local/a.png", "mime": "image/png", "hash": "a"},
        ],
    )
    assert det["pago"]["pago_id"] == pago_id
    assert len(det["movimientos"]) == 1
    pago_mov_id = int(det["movimientos"][0]["pago_mov_id"])

    # GET /pagos/{pago_id}
    r = await client.get(f"/pagos/{pago_id}")
    assert r.status_code == 200, r.text
    out = r.json()
    assert out["pago"]["pago_id"] == pago_id
    assert out["factura"]["factura_venta_id"] == pago["factura_venta_id"]
    assert isinstance(out["movimientos"], list)
    assert len(out["movimientos"]) == 1
    assert len(out["movimientos"][0]["comprobantes"]) == 1

    # GET /pagos/{pago_id}/movimientos
    r2 = await client.get(f"/pagos/{pago_id}/movimientos")
    assert r2.status_code == 200, r2.text
    movs = r2.json()
    assert len(movs) == 1
    assert int(movs[0]["pago_mov_id"]) == pago_mov_id
    assert len(movs[0]["comprobantes"]) == 1

    # GET /pagos/{pago_id}/movimientos/{pago_mov_id}
    r3 = await client.get(f"/pagos/{pago_id}/movimientos/{pago_mov_id}")
    assert r3.status_code == 200, r3.text
    mov = r3.json()
    assert int(mov["pago_mov_id"]) == pago_mov_id
    assert len(mov["comprobantes"]) == 1

    # Movimiento inexistente => 404
    r4 = await client.get(f"/pagos/{pago_id}/movimientos/99999999")
    assert r4.status_code == 404, r4.text
    assert r4.json()["detail"] == "Movimiento no encontrado"


@pytest.mark.anyio
async def test_list_pagos_contrato_y_cuenta_movimientos(client, db_conn):
    contrato_id, cliente_id = _get_contrato_activo_y_cliente(db_conn)
    medio_pago_id = _get_medio_pago_id(db_conn)
    tipo_pago_id = _get_tipo_pago_id(db_conn)

    today = date.today()
    # Genero dos periodos distintos (mes actual y mes anterior si posible)
    pago_1 = await _generar_pago_periodo(client, contrato_id, today.year, today.month, bonificacion=0)

    # Intento generar mes anterior: si es enero, uso diciembre del año anterior
    if today.month == 1:
        anio2, mes2 = today.year - 1, 12
    else:
        anio2, mes2 = today.year, today.month - 1

    # Si el contrato inició este mes, puede fallar por "período anterior al inicio".
    # Entonces: si falla, no forzamos; testeamos con uno solo.
    r_try = await client.post(
        f"/contratos/{contrato_id}/pagos/generar",
        json={
            "periodo_anio_pago": anio2,
            "periodo_mes_pago": mes2,
            "fecha_emision": str(date.today()),
            "fecha_vencimiento": None,
            "bonificacion_previa": 0,
        },
    )
    pago_2 = None
    if r_try.status_code == 200:
        pago_2 = r_try.json()["pago"]
    else:
        assert r_try.status_code in (409, 422), r_try.text

    # Registro un pago parcial al primer período para que haya movimientos
    total_1 = Decimal(str(pago_1["total_factura"]))
    await _registrar_mov(
        client,
        int(pago_1["pago_id"]),
        monto=(total_1 / 2).quantize(Decimal("0.01")),
        medio_pago_id=medio_pago_id,
        tipo_pago_id=tipo_pago_id,
        comps=[],
    )

    # GET /contratos/{id}/pagos (sin filtros)
    r = await client.get(f"/contratos/{contrato_id}/pagos")
    assert r.status_code == 200, r.text
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    # Debe incluir el pago_1
    ids = {int(i["pago_id"]) for i in items}
    assert int(pago_1["pago_id"]) in ids

    # GET /contratos/{id}/pagos?anio=...&mes=...
    r2 = await client.get(f"/contratos/{contrato_id}/pagos", params={"anio": today.year, "mes": today.month})
    assert r2.status_code == 200, r2.text
    items2 = r2.json()
    assert any(int(i["pago_id"]) == int(pago_1["pago_id"]) for i in items2)

    # Cuenta: estado calculado consistente
    r3 = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r3.status_code == 200, r3.text
    cta = r3.json()
    assert "saldo_cuenta" in cta
    assert cta["estado_calculado"] in ("DEUDOR", "AL_DIA", "SALDO_A_FAVOR")

    # Movimientos de cuenta: debe devolver al menos 2 (FACTURA + PAGO)
    r4 = await client.get(f"/clientes/{cliente_id}/cuenta/movimientos", params={"limit": 50, "offset": 0})
    assert r4.status_code == 200, r4.text
    data = r4.json()
    assert "movimientos" in data
    movs = data["movimientos"]
    assert isinstance(movs, list)
    assert len(movs) >= 2

    # Filtro por tipo=FACTURA y tipo=PAGO (si tu repo usa codigo_tipo_mov_det_cuenta)
    r5 = await client.get(f"/clientes/{cliente_id}/cuenta/movimientos", params={"tipo": "FACTURA", "limit": 50, "offset": 0})
    assert r5.status_code == 200, r5.text
    movs_f = r5.json()["movimientos"]
    assert all(m["tipo"] == "FACTURA" for m in movs_f)

    r6 = await client.get(f"/clientes/{cliente_id}/cuenta/movimientos", params={"tipo": "PAGO", "limit": 50, "offset": 0})
    assert r6.status_code == 200, r6.text
    movs_p = r6.json()["movimientos"]
    assert all(m["tipo"] == "PAGO" for m in movs_p)
