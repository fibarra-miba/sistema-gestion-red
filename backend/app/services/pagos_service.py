# app/services/pagos_service.py

from __future__ import annotations

from datetime import date, datetime, time, timezone
from decimal import Decimal

from fastapi import HTTPException

from app.repositories.catalogos_repo import CatalogosRepo
from app.repositories.contratos_repo import ContractRepository
from app.repositories.pagos_repo import PagosRepo
from app.repositories.precios_repo import PreciosRepo
from app.repositories.promociones_repo import PromocionesRepo
from app.repositories.cuentas_repo import CuentaRepo
from app.services.precios_service import PricingService
from app.services.cuenta_corriente_service import CuentaCorrienteService


def _as_dt(d: date | None) -> datetime | None:
    if d is None:
        return None
    return datetime.combine(d, time.min, tzinfo=timezone.utc)


class PagosService:
    # Definición de "cobrable" (ajustable)
    COBRABLE_ESTADOS_CONTRATO = {"ACTIVO"}

    def __init__(
        self,
        contratos_repo: ContractRepository,
        pagos_repo: PagosRepo,
        catalogos_repo: CatalogosRepo,
        precios_repo: PreciosRepo,
        promo_repo: PromocionesRepo,
        cuenta_repo: CuentaRepo,
    ):
        self.contratos_repo = contratos_repo
        self.pagos_repo = pagos_repo
        self.catalogos_repo = catalogos_repo
        self.pricing = PricingService(precios_repo, promo_repo)
        self.cc = CuentaCorrienteService(cuenta_repo, catalogos_repo)

    def generar_periodo_individual(
        self,
        contrato_id: int,
        periodo_anio_pago: int,
        periodo_mes_pago: int,
        fecha_emision: date,
        fecha_vencimiento: date | None,
        bonificacion_previa,
    ) -> dict:
        contrato = self.contratos_repo.get_contrato(contrato_id)
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato no encontrado")

        if contrato["estado"] not in self.COBRABLE_ESTADOS_CONTRATO:
            raise HTTPException(status_code=422, detail="Contrato no cobrable")

        if not self.contratos_repo.validar_no_periodo_anterior_inicio(
            contrato["fecha_inicio"], periodo_anio_pago, periodo_mes_pago
        ):
            raise HTTPException(status_code=422, detail="Período anterior al inicio del contrato")

        if self.pagos_repo.pago_periodo_existe(contrato_id, periodo_anio_pago, periodo_mes_pago):
            raise HTTPException(status_code=409, detail="Pago del período ya existe")

        # pricing (base + promo + bonificación previa)
        try:
            pr = self.pricing.calcular_total(
                plan_id=contrato["plan_id"],
                fecha_emision=fecha_emision,
                aplica_promocion=bool(contrato["aplica_promocion"]),
                promocion_id=contrato["promocion_id"],
                bonificacion_previa=bonificacion_previa,
            )
        except ValueError as e:
            if str(e) == "PRECIO_NO_VIGENTE":
                raise HTTPException(status_code=422, detail="Precio base no vigente")
            if str(e) == "PROMO_NO_VIGENTE":
                raise HTTPException(status_code=422, detail="Promoción no vigente")
            raise HTTPException(status_code=422, detail=f"Pricing inválido: {e}")

        estado_fact_id = self.catalogos_repo.get_estado_factura_venta_id("EMITIDA")
        estado_pago_pend_id = self.catalogos_repo.get_estado_pago_id("PENDIENTE")

        concepto = f"Servicio Internet {periodo_mes_pago:02d}/{periodo_anio_pago}"

        factura_id = self.pagos_repo.insert_factura_venta(
            cliente_id=contrato["cliente_id"],
            estado_factura_venta_id=estado_fact_id,
            concepto=concepto,
            fecha_emision=_as_dt(fecha_emision) or datetime.now(timezone.utc),
            fecha_vencimiento=_as_dt(fecha_vencimiento),
            importe_base=pr.importe_factura,
            bonificacion=pr.bonificacion,
            total=pr.total,
        )

        pago_id = self.pagos_repo.insert_pago(
            contrato_id=contrato_id,
            factura_venta_id=factura_id,
            periodo_anio_pago=periodo_anio_pago,
            periodo_mes_pago=periodo_mes_pago,
            estado_pago_id=estado_pago_pend_id,
        )

        # Movimiento cuenta corriente: FACTURA (DEBE) por total
        saldo = self.cc.aplicar_movimiento(
            cliente_id=contrato["cliente_id"],
            tipo_codigo="FACTURA",
            importe=pr.total,
            factura_venta_id=factura_id,
            pago_id=None,
            observacion=f"Factura período {periodo_mes_pago:02d}/{periodo_anio_pago}",
        )

        total_pagado = Decimal("0.00")
        saldo_pend = pr.total

        return {
            "pago_id": pago_id,
            "contrato_id": contrato_id,
            "factura_venta_id": factura_id,
            "periodo_anio_pago": periodo_anio_pago,
            "periodo_mes_pago": periodo_mes_pago,
            "estado": "PENDIENTE",
            "total_factura": pr.total,
            "total_pagado": total_pagado,
            "saldo_pendiente": saldo_pend,
            "excedente_credito": Decimal("0.00"),
            "saldo_cuenta_resultante": saldo["saldo_resultante"],
        }

    def generar_lote(
        self,
        periodo_anio_pago: int,
        periodo_mes_pago: int,
        fecha_emision: date,
        fecha_vencimiento: date | None,
        bonificacion_default,
    ) -> dict:

        #contratos = self.contratos_repo.list_contratos_cobrables(self.COBRABLE_ESTADOS_CONTRATO)
        contratos = self.contratos_repo.list_contratos_cobrables(datetime.now(timezone.utc))
        creados = 0
        omitidos = 0
        errores: list[dict] = []

        for c in contratos:
            try:
                with self.pagos_repo.conn.transaction():

                    if self.pagos_repo.pago_periodo_existe(
                        c["contrato_id"], periodo_anio_pago, periodo_mes_pago
                    ):
                        omitidos += 1
                        continue

                    _ = self.generar_periodo_individual(
                        contrato_id=c["contrato_id"],
                        periodo_anio_pago=periodo_anio_pago,
                        periodo_mes_pago=periodo_mes_pago,
                        fecha_emision=fecha_emision,
                        fecha_vencimiento=fecha_vencimiento,
                        bonificacion_previa=bonificacion_default,
                    )

                    creados += 1

            except HTTPException as he:
                errores.append(
                    {
                        "contrato_id": c["contrato_id"],
                        "error": he.detail,
                        "status_code": he.status_code,
                    }
                )
            except Exception as e:
                errores.append(
                    {"contrato_id": c["contrato_id"], "error": str(e), "status_code": 500}
                )

        return {
            "creados": creados,
            "omitidos_existentes": omitidos,
            "errores": errores,
        }

    def registrar_movimiento_pago(
        self,
        pago_id: int,
        fecha_pago: datetime,
        monto,
        medio_pago_id: int,
        tipo_pago_id: int,
        observacion: str | None,
        comprobantes: list[dict] | None,
    ) -> dict:

        pago = self.pagos_repo.get_pago(pago_id)
        if not pago:
            raise HTTPException(status_code=404, detail="Pago no encontrado")

        monto = Decimal(monto)

        # 1) Insert movimiento + comprobantes
        pago_mov_id = self.pagos_repo.insert_pago_movimiento(
            pago_id=pago_id,
            fecha_pago=fecha_pago,
            monto=monto,
            medio_pago_id=medio_pago_id,
            tipo_pago_id=tipo_pago_id,
        )

        comp_out = []
        if comprobantes:
            for c in comprobantes:
                cid = self.pagos_repo.insert_comprobante(
                    pago_mov_id=pago_mov_id,
                    url=c["url"],
                    mime=c.get("mime"),
                    hash_=c.get("hash"),
                )
                comp_out.append(
                    {
                        "pago_comprobante_id": cid,
                        "comprobante_url": c["url"],
                        "comprobante_mime": c.get("mime"),
                        "comprobante_hash": c.get("hash"),
                        "comprobante_created_at": datetime.now(timezone.utc),
                    }
                )

        # 2) Movimiento cuenta corriente (HABER)
        saldo = self.cc.aplicar_movimiento(
            cliente_id=pago["cliente_id"],
            tipo_codigo="PAGO",
            importe=monto,
            factura_venta_id=None,
            pago_id=pago_id,
            observacion=observacion,
        )

        # 3) Recalcular estado pago
        total_pagado = Decimal(self.pagos_repo.sum_movimientos_pago(pago_id))
        total_factura = Decimal(pago["total"])

        if total_pagado == 0:
            estado = "PENDIENTE"
        elif total_pagado < total_factura:
            estado = "PARCIAL"
        else:
            estado = "PAGADO"

        estado_id = self.catalogos_repo.get_estado_pago_id(estado)
        self.pagos_repo.update_estado_pago(pago_id, estado_id)

        saldo_pend = total_factura - total_pagado
        if saldo_pend < 0:
            saldo_pend = Decimal("0.00")

        excedente = total_pagado - total_factura
        if excedente < 0:
            excedente = Decimal("0.00")

        # FIX CLAVE: nunca devolver saldo negativo
        saldo_resultante = Decimal(saldo["saldo_resultante"])
        if saldo_resultante < 0:
            saldo_resultante = Decimal("0.00")

        return {
            "pago_id": pago_id,
            "estado": estado,
            "total_factura": total_factura,
            "total_pagado": total_pagado,
            "saldo_pendiente": saldo_pend,
            "excedente_credito": excedente,
            "movimiento": {
                "pago_mov_id": pago_mov_id,
                "pago_id": pago_id,
                "fecha_pago": fecha_pago,
                "monto_pago": monto,
                "medio_pago_id": medio_pago_id,
                "tipo_pago_id": tipo_pago_id,
                "comprobantes": comp_out,
            },
            "saldo_cuenta_resultante": saldo_resultante,
        }

    def get_pago_detalle(self, pago_id: int) -> dict:
        pago = self.pagos_repo.get_pago(pago_id)
        if not pago:
            raise HTTPException(status_code=404, detail="Pago no encontrado")

        total_pagado = Decimal(self.pagos_repo.sum_movimientos_pago(pago_id))
        total_factura = Decimal(pago["total"])

        saldo_pend = total_factura - total_pagado
        if saldo_pend < 0:
            saldo_pend = Decimal("0.00")
        excedente = total_pagado - total_factura
        if excedente < 0:
            excedente = Decimal("0.00")

        movs = self.pagos_repo.list_movimientos(pago_id)
        for m in movs:
            m["comprobantes"] = self.pagos_repo.list_comprobantes_by_mov(m["pago_mov_id"])

        # saldo cuenta actual
        cta = self.cc._get_or_create_cuenta(pago["cliente_id"])

        return {
            "pago": {
                "pago_id": pago["pago_id"],
                "contrato_id": pago["contrato_id"],
                "factura_venta_id": pago["factura_venta_id"],
                "periodo_anio_pago": pago["periodo_anio_pago"],
                "periodo_mes_pago": pago["periodo_mes_pago"],
                "estado": pago["estado"],  # puede quedar desfasado si no pediste update; UI usa cálculo:
                "total_factura": total_factura,
                "total_pagado": total_pagado,
                "saldo_pendiente": saldo_pend,
                "excedente_credito": excedente,
            },
            "factura": {
                "factura_venta_id": pago["factura_venta_id"],
                "cliente_id": pago["cliente_id"],
                "fecha_emision": pago["fecha_emision"],
                "fecha_vencimiento": pago["fecha_vencimiento"],
                "importe_base": Decimal(pago["importe_base"]),
                "bonificacion": Decimal(pago["bonificacion"]),
                "total": total_factura,
            },
            "movimientos": movs,
            "saldo_cuenta_resultante": Decimal(cta["saldo_cuenta"]),
        }

    def patch_factura_bonificacion(self, factura_venta_id: int, bonificacion_nueva) -> dict:
        fac = self.pagos_repo.get_factura(factura_venta_id)
        if not fac:
            raise HTTPException(status_code=404, detail="Factura no encontrada")

        base = Decimal(fac["importe_base"])
        total_old = Decimal(fac["total"])

        bonif_new = Decimal(bonificacion_nueva)
        total_new = base - bonif_new
        if total_new < 0:
            total_new = Decimal("0.00")

        diff = total_new - total_old  # (+) aumenta deuda, (-) reduce deuda

        with self.pagos_repo.conn.transaction():
            self.pagos_repo.update_factura_bonificacion(factura_venta_id, bonif_new, total_new)

            if diff != 0:
                tipo_codigo = "AJUSTE_D" if diff > 0 else "AJUSTE_H"
                importe = diff if diff > 0 else -diff

                saldo = self.cc.aplicar_movimiento(
                    cliente_id=fac["cliente_id"],
                    tipo_codigo=tipo_codigo,
                    importe=importe,
                    factura_venta_id=factura_venta_id,
                    pago_id=None,
                    observacion=f"Ajuste bonificación factura {factura_venta_id}",
                )
            else:
                saldo = self.cc._get_or_create_cuenta(fac["cliente_id"])
                saldo = {"saldo_resultante": Decimal(saldo["saldo_cuenta"])}

        return {
            "factura_venta_id": factura_venta_id,
            "total_old": total_old,
            "total_new": total_new,
            "diff": diff,
            "saldo_cuenta_resultante": saldo["saldo_resultante"],
        }

    def list_pagos_contrato(self, contrato_id: int, anio, mes, estado, limit, offset) -> list[dict]:
        items = self.pagos_repo.list_pagos_by_contrato(contrato_id, anio, mes, estado, limit, offset)
        out = []
        for it in items:
            total_pagado = Decimal(self.pagos_repo.sum_movimientos_pago(it["pago_id"]))
            total_factura = Decimal(it["total_factura"])
            saldo_pend = total_factura - total_pagado
            if saldo_pend < 0:
                saldo_pend = Decimal("0.00")
            excedente = total_pagado - total_factura
            if excedente < 0:
                excedente = Decimal("0.00")

            out.append(
                {
                    **it,
                    "total_pagado": total_pagado,
                    "saldo_pendiente": saldo_pend,
                    "excedente_credito": excedente,
                }
            )
        return out

    def get_cuenta_cliente(self, cliente_id: int) -> dict:
        cta = self.cc._get_or_create_cuenta(cliente_id)
        saldo = Decimal(cta["saldo_cuenta"])
        deuda = saldo if saldo > 0 else Decimal("0.00")
        credito = -saldo if saldo < 0 else Decimal("0.00")
        estado_calc = "DEUDOR" if saldo > 0 else ("AL_DIA" if saldo == 0 else "SALDO_A_FAVOR")
        return {
            "cliente_id": cliente_id,
            "saldo_cuenta": saldo,
            "deuda_actual": deuda,
            "credito_actual": credito,
            "estado_calculado": estado_calc,
        }