from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest


def _get_contrato_activo_y_cliente(db_conn) -> tuple[int, int, int]:
    """
    Devuelve (contrato_id, cliente_id, plan_id) de un contrato cobrable (estado_contrato_id=3).
    Requiere seed con al menos 1 contrato activo.
    """
    with db_conn.cursor() as cur:
        cur.execute(
            """
            SELECT contrato_id, cliente_id, plan_id
              FROM contratos
             WHERE estado_contrato_id = 3
             ORDER BY contrato_id ASC
             LIMIT 1
            """
        )
        row = cur.fetchone()
        assert row is not None, "Seed: falta al menos 1 contrato ACTIVO (estado_contrato_id=3)"
        return int(row[0]), int(row[1]), int(row[2])


def _get_precio_plan_activo(db_conn, plan_id: int) -> Decimal:
    with db_conn.cursor() as cur:
        cur.execute(
            """
            SELECT precio_mensual_pplanes
              FROM precios_planes
             WHERE plan_id = %s
               AND activo_pplanes = TRUE
             ORDER BY fecha_desde_pplanes DESC
             LIMIT 1
            """,
            (plan_id,),
        )
        row = cur.fetchone()
        assert row is not None, "Seed: falta precio activo para el plan del contrato"
        return Decimal(str(row[0]))


@pytest.mark.anyio
async def test_generar_periodo_ok_crea_factura_pago_y_mueve_cuenta(client, db_conn):
    contrato_id, cliente_id, plan_id = _get_contrato_activo_y_cliente(db_conn)

    today = date.today()
    body = {
        "periodo_anio_pago": today.year,
        "periodo_mes_pago": today.month,
        "fecha_emision": str(today),
        "fecha_vencimiento": None,
        "bonificacion_previa": 0,
    }

    # Saldo inicial
    r0 = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r0.status_code == 200, r0.text
    saldo_inicial = Decimal(str(r0.json()["saldo_cuenta"]))

    # Act
    r = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r.status_code == 200, r.text
    payload = r.json()

    assert "pago" in payload
    pago = payload["pago"]

    assert pago["contrato_id"] == contrato_id
    assert pago["periodo_anio_pago"] == today.year
    assert pago["periodo_mes_pago"] == today.month

    assert int(pago["pago_id"]) > 0
    assert int(pago["factura_venta_id"]) > 0

    assert pago["estado"] == "PENDIENTE"

    total_factura = Decimal(str(pago["total_factura"]))
    assert total_factura >= 0

    assert Decimal(str(pago["total_pagado"])) == Decimal("0")
    assert Decimal(str(pago["excedente_credito"])) == Decimal("0")
    assert Decimal(str(pago["saldo_pendiente"])) == total_factura

    # Assert saldo final = saldo inicial + total_factura (mov FACTURA = DEBE)
    r2 = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r2.status_code == 200, r2.text
    saldo_final = Decimal(str(r2.json()["saldo_cuenta"]))

    assert saldo_final == saldo_inicial + total_factura

    # Chequeo simple de que total_factura no excede al precio base (sin promo ni bonif)
    # (es un sanity check; si después metés promo/bonif default, ajustar)
    precio_base = _get_precio_plan_activo(db_conn, plan_id)
    assert total_factura <= precio_base


@pytest.mark.anyio
async def test_generar_periodo_duplicado_409(client, db_conn):
    contrato_id, _, _ = _get_contrato_activo_y_cliente(db_conn)

    today = date.today()
    body = {
        "periodo_anio_pago": today.year,
        "periodo_mes_pago": today.month,
        "fecha_emision": str(today),
        "fecha_vencimiento": None,
        "bonificacion_previa": 0,
    }

    r1 = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r1.status_code == 200, r1.text

    r2 = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r2.status_code == 409, r2.text
    assert r2.json()["detail"] == "Pago del período ya existe"


@pytest.mark.anyio
async def test_generar_periodo_precio_no_vigente_422(client, db_conn):
    contrato_id, _, plan_id = _get_contrato_activo_y_cliente(db_conn)

    # Forzamos precio no vigente: desactivamos precios del plan
    with db_conn.cursor() as cur:
        cur.execute(
            """
            UPDATE precios_planes
               SET activo_pplanes = FALSE
             WHERE plan_id = %s
            """,
            (plan_id,),
        )
        db_conn.commit()

    today = date.today()
    body = {
        "periodo_anio_pago": today.year,
        "periodo_mes_pago": today.month,
        "fecha_emision": str(today),
        "fecha_vencimiento": None,
        "bonificacion_previa": 0,
    }

    r = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r.status_code == 422, r.text
    assert r.json()["detail"] == "Precio base no vigente"


@pytest.mark.anyio
async def test_generar_periodo_promo_no_vigente_422(client, db_conn):
    contrato_id, _, _ = _get_contrato_activo_y_cliente(db_conn)

    # Buscamos una promo vencida (fecha_hasta < hoy) y activa=true
    with db_conn.cursor() as cur:
        cur.execute(
            """
            SELECT promocion_id
              FROM promociones
             WHERE activo_promo = TRUE
               AND fecha_vigencia_hasta_promo IS NOT NULL
               AND fecha_vigencia_hasta_promo < CURRENT_DATE
             ORDER BY promocion_id ASC
             LIMIT 1
            """
        )
        row = cur.fetchone()
        assert row is not None, "Seed: falta una promoción vencida para este test"
        promo_id = int(row[0])

        cur.execute(
            """
            UPDATE contratos
               SET aplica_promocion = TRUE,
                   promocion_id = %s
             WHERE contrato_id = %s
            """,
            (promo_id, contrato_id),
        )
        db_conn.commit()

    today = date.today()
    body = {
        "periodo_anio_pago": today.year,
        "periodo_mes_pago": today.month,
        "fecha_emision": str(today),
        "fecha_vencimiento": None,
        "bonificacion_previa": 0,
    }

    r = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r.status_code == 422, r.text
    assert r.json()["detail"] == "Promoción no vigente"
