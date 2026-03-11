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
        cur.execute(
            """
            SELECT medio_pago_id
              FROM medios_pagos
             ORDER BY medio_pago_id ASC
             LIMIT 1
            """
        )
        row = cur.fetchone()
        assert row is not None, "Seed: falta al menos 1 medio de pago"
        return int(row[0])


def _get_tipo_pago_id(db_conn) -> int:
    with db_conn.cursor() as cur:
        cur.execute(
            """
            SELECT tipo_pago_id
              FROM tipo_pago
             ORDER BY tipo_pago_id ASC
             LIMIT 1
            """
        )
        row = cur.fetchone()
        assert row is not None, "Seed: falta al menos 1 tipo de pago"
        return int(row[0])


async def _generar_pago_periodo(client, contrato_id: int, bonificacion_previa=0):
    today = date.today()
    body = {
        "periodo_anio_pago": today.year,
        "periodo_mes_pago": today.month,
        "fecha_emision": str(today),
        "fecha_vencimiento": None,
        "bonificacion_previa": bonificacion_previa,
    }
    r = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r.status_code == 200, r.text
    return r.json()["pago"]  # pago resumido (pago_id, total_factura, etc.)


@pytest.mark.anyio
async def test_registrar_movimiento_pago_parcial(client, db_conn):
    contrato_id, cliente_id = _get_contrato_activo_y_cliente(db_conn)
    medio_pago_id = _get_medio_pago_id(db_conn)
    tipo_pago_id = _get_tipo_pago_id(db_conn)

    pago = await _generar_pago_periodo(client, contrato_id, bonificacion_previa=0)
    pago_id = int(pago["pago_id"])
    total_factura = Decimal(str(pago["total_factura"]))
    assert total_factura > 0, "Para pago parcial, seed debe generar total_factura > 0"

    monto = (total_factura / 2).quantize(Decimal("0.01"))

    body = {
        "fecha_pago": datetime.utcnow().isoformat(),
        "monto_pago": str(monto),
        "medio_pago_id": medio_pago_id,
        "tipo_pago_id": tipo_pago_id,
        "observacion": "pago parcial test",
        "comprobantes": [],
    }

    r = await client.post(f"/pagos/{pago_id}/movimientos", json=body)
    assert r.status_code == 200, r.text
    det = r.json()

    assert det["pago"]["pago_id"] == pago_id
    assert det["pago"]["estado"] == "PARCIAL"
    assert Decimal(str(det["pago"]["total_pagado"])) == monto
    assert Decimal(str(det["pago"]["saldo_pendiente"])) == (total_factura - monto)
    assert Decimal(str(det["pago"]["excedente_credito"])) == Decimal("0")

    # Verifica que se creó 1 movimiento con ese monto
    movs = det["movimientos"]
    assert len(movs) == 1
    assert Decimal(str(movs[0]["monto_pago"])) == monto

    # Verifica que el saldo de cuenta disminuyó por el pago (HABER): saldo_final = saldo_inicial + factura - pago
    r_cta = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r_cta.status_code == 200, r_cta.text
    saldo = Decimal(str(r_cta.json()["saldo_cuenta"]))
    assert saldo == (total_factura - monto)


@pytest.mark.anyio
async def test_registrar_movimiento_pago_total(client, db_conn):
    contrato_id, cliente_id = _get_contrato_activo_y_cliente(db_conn)
    medio_pago_id = _get_medio_pago_id(db_conn)
    tipo_pago_id = _get_tipo_pago_id(db_conn)

    pago = await _generar_pago_periodo(client, contrato_id, bonificacion_previa=0)
    pago_id = int(pago["pago_id"])
    total_factura = Decimal(str(pago["total_factura"]))

    body = {
        "fecha_pago": datetime.utcnow().isoformat(),
        "monto_pago": str(total_factura),
        "medio_pago_id": medio_pago_id,
        "tipo_pago_id": tipo_pago_id,
        "observacion": "pago total test",
        "comprobantes": [],
    }

    r = await client.post(f"/pagos/{pago_id}/movimientos", json=body)
    assert r.status_code == 200, r.text
    det = r.json()

    assert det["pago"]["estado"] == "PAGADO"
    assert Decimal(str(det["pago"]["total_pagado"])) == total_factura
    assert Decimal(str(det["pago"]["saldo_pendiente"])) == Decimal("0")
    assert Decimal(str(det["pago"]["excedente_credito"])) == Decimal("0")

    # saldo cuenta debe quedar 0 (factura D - pago H)
    r_cta = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r_cta.status_code == 200, r_cta.text
    saldo = Decimal(str(r_cta.json()["saldo_cuenta"]))
    assert saldo == Decimal("0")
    assert r_cta.json()["estado_calculado"] == "AL_DIA"


@pytest.mark.anyio
async def test_registrar_movimiento_pago_excedente_genera_saldo_a_favor(client, db_conn):
    contrato_id, cliente_id = _get_contrato_activo_y_cliente(db_conn)
    medio_pago_id = _get_medio_pago_id(db_conn)
    tipo_pago_id = _get_tipo_pago_id(db_conn)

    pago = await _generar_pago_periodo(client, contrato_id, bonificacion_previa=0)
    pago_id = int(pago["pago_id"])
    total_factura = Decimal(str(pago["total_factura"]))
    excedente = Decimal("123.45")
    monto = (total_factura + excedente).quantize(Decimal("0.01"))

    body = {
        "fecha_pago": datetime.utcnow().isoformat(),
        "monto_pago": str(monto),
        "medio_pago_id": medio_pago_id,
        "tipo_pago_id": tipo_pago_id,
        "observacion": "pago excedente test",
        "comprobantes": [],
    }

    r = await client.post(f"/pagos/{pago_id}/movimientos", json=body)
    assert r.status_code == 200, r.text
    det = r.json()

    assert det["pago"]["estado"] == "PAGADO"
    assert Decimal(str(det["pago"]["saldo_pendiente"])) == Decimal("0")
    assert Decimal(str(det["pago"]["excedente_credito"])) == excedente

    # saldo cuenta debe quedar negativo (saldo a favor): factura (D) - pago (H)
    r_cta = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r_cta.status_code == 200, r_cta.text
    saldo = Decimal(str(r_cta.json()["saldo_cuenta"]))
    assert saldo == -excedente
    assert r_cta.json()["estado_calculado"] == "SALDO_A_FAVOR"
    assert Decimal(str(r_cta.json()["credito_actual"])) == excedente


@pytest.mark.anyio
async def test_registrar_movimiento_pago_con_comprobantes_multiples(client, db_conn):
    contrato_id, _ = _get_contrato_activo_y_cliente(db_conn)
    medio_pago_id = _get_medio_pago_id(db_conn)
    tipo_pago_id = _get_tipo_pago_id(db_conn)

    pago = await _generar_pago_periodo(client, contrato_id, bonificacion_previa=0)
    pago_id = int(pago["pago_id"])
    total_factura = Decimal(str(pago["total_factura"]))
    monto = (total_factura / 3).quantize(Decimal("0.01"))

    body = {
        "fecha_pago": datetime.utcnow().isoformat(),
        "monto_pago": str(monto),
        "medio_pago_id": medio_pago_id,
        "tipo_pago_id": tipo_pago_id,
        "observacion": "pago con comps test",
        "comprobantes": [
            {"url": "https://files.local/comp1.png", "mime": "image/png", "hash": "h1"},
            {"url": "https://files.local/comp2.pdf", "mime": "application/pdf", "hash": "h2"},
        ],
    }

    r = await client.post(f"/pagos/{pago_id}/movimientos", json=body)
    assert r.status_code == 200, r.text
    det = r.json()

    assert len(det["movimientos"]) == 1
    mov = det["movimientos"][0]
    assert "comprobantes" in mov
    assert len(mov["comprobantes"]) == 2

    urls = {c["comprobante_url"] for c in mov["comprobantes"]}
    assert urls == {"https://files.local/comp1.png", "https://files.local/comp2.pdf"}

    # También valido que GET movimientos devuelva esos comprobantes (ruta B)
    r2 = await client.get(f"/pagos/{pago_id}/movimientos")
    assert r2.status_code == 200, r2.text
    movs = r2.json()
    assert len(movs) == 1
    assert len(movs[0]["comprobantes"]) == 2
