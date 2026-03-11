# app/services/precios_service.py

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from app.repositories.precios_repo import PreciosRepo
from app.repositories.promociones_repo import PromocionesRepo


@dataclass(frozen=True)
class PricingResult:
    importe_base: Decimal            # precio base del plan
    importe_factura: Decimal         # base - descuento_promo (clamp >= 0)
    descuento_promo: Decimal         # descuento aplicado por promo
    bonificacion: Decimal            # bonificación pre-emisión
    total: Decimal                   # importe_factura - bonificación (clamp >= 0)


class PricingService:
    def __init__(self, precios_repo: PreciosRepo, promo_repo: PromocionesRepo):
        self.precios_repo = precios_repo
        self.promo_repo = promo_repo

    def calcular_total(
        self,
        plan_id: int,
        fecha_emision: date,
        aplica_promocion: bool,
        promocion_id: int | None,
        bonificacion_previa,
    ) -> PricingResult:
        precio = self.precios_repo.get_precio_base_vigente(plan_id, fecha_emision)
        if not precio:
            raise ValueError("PRECIO_NO_VIGENTE")

        base = Decimal(precio["precio"]).quantize(Decimal("0.01"))
        descuento_promo = Decimal("0.00")
        importe_factura = base

        if aplica_promocion:
            if not promocion_id:
                raise ValueError("PROMO_INCONSISTENTE")
            promo = self.promo_repo.get_promocion(promocion_id)
            if not promo or not self.promo_repo.promo_vigente(promo, fecha_emision):
                raise ValueError("PROMO_NO_VIGENTE")

            tipo = (promo["tipo_desc"] or "").upper()
            if tipo == "PORCENTAJE":
                pct = Decimal(promo["porcentaje"] or 0)
                descuento_promo = (base * pct / Decimal("100")).quantize(Decimal("0.01"))
            elif tipo == "DESCUENTO_FIJO":
                descuento_promo = Decimal(promo["monto"] or 0).quantize(Decimal("0.01"))
            else:
                raise ValueError("TIPO_PROMO_INVALIDO")

            importe_factura = base - descuento_promo
            if importe_factura < 0:
                importe_factura = Decimal("0.00")

        bonif = Decimal(bonificacion_previa or 0).quantize(Decimal("0.01"))

        total = importe_factura - bonif
        if total < 0:
            total = Decimal("0.00")

        return PricingResult(
            importe_base=base,
            importe_factura=importe_factura.quantize(Decimal("0.01")),
            descuento_promo=descuento_promo.quantize(Decimal("0.01")),
            bonificacion=bonif,
            total=total.quantize(Decimal("0.01")),
        )