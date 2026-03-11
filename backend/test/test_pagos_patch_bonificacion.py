from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest


def _get_contrato_activo(db_conn) -> int:
    with db_conn.cursor() as cur:
        cur.execute(
            """
            SELECT contrato_id
              FROM contratos
             WHERE estado_contrato_id = 3
             ORDER BY contrato_id ASC
             LIMIT 1
            """
        )
        row = cur.fetchone()
        assert row is not None, "Seed: falta al menos 1 contrato ACTIVO (estado_contrato_id=3)"
        return int(row[0])


async def _generar_pago_periodo(client, contrato_id: int, bonificacion_previa=0):
    today = date.today()
    body = {
        "periodo_anio_pago": today.year,
        "periodo_mes_pago": today.month,
        "fecha_emision": str(today),
        "fecha_vencimiento": None,
        "bonificacion_previa": str(bonificacion_previa),
    }
    r = await client.post(f"/contratos/{contrato_id}/pagos/generar", json=body)
    assert r.status_code == 200, r.text
    return r.json()["pago"]


@pytest.mark.anyio
async def test_patch_bonificacion_ajuste_h_reduce_deuda(client, db_conn):
    """
    Caso AJUSTE_H: aumento bonificación => total_new < total_old => diff < 0
    Debe insertar movimiento AJUSTE_H (H) y reducir saldo_cuenta.
    """
    contrato_id = _get_contrato_activo(db_conn)

    pago = await _generar_pago_periodo(client, contrato_id, bonificacion_previa=0)
    factura_id = int(pago["factura_venta_id"])
    total_old = Decimal(str(pago["total_factura"]))
    assert total_old > 0

    # Aumentamos bonificación en 100 (clamp si supera)
    bonif_new = Decimal("100.00")
    r = await client.patch(
        f"/facturas-ventas/{factura_id}",
        json={"bonificacion_fventas": str(bonif_new)},
    )
    assert r.status_code == 200, r.text
    out = r.json()

    assert int(out["factura_venta_id"]) == factura_id
    assert Decimal(str(out["total_old"])) == total_old

    total_new = Decimal(str(out["total_new"]))
    diff = Decimal(str(out["diff"]))

    assert total_new == max(Decimal("0.00"), total_old - bonif_new)
    assert diff == total_new - total_old
    assert diff < 0  # AJUSTE_H

    # Validamos saldo por endpoint cuenta (cliente seed=1; si no, lo buscamos por DB)
    # Para evitar acoplar a seed, buscamos cliente_id desde factura_ventas
    with db_conn.cursor() as cur:
        cur.execute("SELECT cliente_id FROM facturas_ventas WHERE factura_venta_id = %s", (factura_id,))
        row = cur.fetchone()
        assert row is not None
        cliente_id = int(row[0])

    r_cta = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r_cta.status_code == 200, r_cta.text
    saldo = Decimal(str(r_cta.json()["saldo_cuenta"]))

    # Luego de generar período sin bonif:
    # saldo inicial era 0 (seed), pasó a total_old (FACTURA D)
    # con AJUSTE_H por |diff| debería bajar: saldo = total_old + diff
    assert saldo == total_old + diff


@pytest.mark.anyio
async def test_patch_bonificacion_ajuste_d_aumenta_deuda(client, db_conn):
    """
    Caso AJUSTE_D: reducir bonificación (o ponerla a 0 desde un valor previo)
    => total_new > total_old => diff > 0
    Debe insertar AJUSTE_D (D) y aumentar saldo_cuenta.
    """
    contrato_id = _get_contrato_activo(db_conn)

    # Genero con bonificación previa para que total_old sea menor
    pago = await _generar_pago_periodo(client, contrato_id, bonificacion_previa=Decimal("50.00"))
    factura_id = int(pago["factura_venta_id"])
    total_old = Decimal(str(pago["total_factura"]))

    # Ahora "reduzco bonificación" a 0 => total sube => AJUSTE_D
    bonif_new = Decimal("0.00")
    r = await client.patch(
        f"/facturas-ventas/{factura_id}",
        json={"bonificacion_fventas": str(bonif_new)},
    )
    assert r.status_code == 200, r.text
    out = r.json()

    total_new = Decimal(str(out["total_new"]))
    diff = Decimal(str(out["diff"]))

    assert diff == total_new - total_old
    assert diff > 0  # AJUSTE_D

    with db_conn.cursor() as cur:
        cur.execute("SELECT cliente_id FROM facturas_ventas WHERE factura_venta_id = %s", (factura_id,))
        row = cur.fetchone()
        assert row is not None
        cliente_id = int(row[0])

    r_cta = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r_cta.status_code == 200, r_cta.text
    saldo = Decimal(str(r_cta.json()["saldo_cuenta"]))

    # saldo luego de generar (con bonif previa): total_old
    # luego AJUSTE_D suma diff: saldo = total_old + diff
    assert saldo == total_old + diff
    assert saldo > total_old


@pytest.mark.anyio
async def test_patch_bonificacion_diff_cero_no_mueve_cuenta(client, db_conn):
    """
    Si seteás la misma bonificación que ya tiene, diff=0 y saldo no cambia.
    """
    contrato_id = _get_contrato_activo(db_conn)

    # Genero con bonificación previa 0
    pago = await _generar_pago_periodo(client, contrato_id, bonificacion_previa=0)
    factura_id = int(pago["factura_venta_id"])
    total_old = Decimal(str(pago["total_factura"]))

    with db_conn.cursor() as cur:
        cur.execute("SELECT cliente_id, bonificacion_fventas FROM facturas_ventas WHERE factura_venta_id = %s", (factura_id,))
        row = cur.fetchone()
        assert row is not None
        cliente_id = int(row[0])
        bonif_actual = Decimal(str(row[1]))

    r_cta0 = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r_cta0.status_code == 200, r_cta0.text
    saldo0 = Decimal(str(r_cta0.json()["saldo_cuenta"]))

    r = await client.patch(
        f"/facturas-ventas/{factura_id}",
        json={"bonificacion_fventas": str(bonif_actual)},
    )
    assert r.status_code == 200, r.text
    out = r.json()

    assert Decimal(str(out["total_old"])) == total_old
    assert Decimal(str(out["diff"])) == Decimal("0")

    r_cta1 = await client.get(f"/clientes/{cliente_id}/cuenta")
    assert r_cta1.status_code == 200, r_cta1.text
    saldo1 = Decimal(str(r_cta1.json()["saldo_cuenta"]))

    assert saldo1 == saldo0
