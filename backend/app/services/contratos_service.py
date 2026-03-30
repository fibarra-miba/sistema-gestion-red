# app/services/contratos_service.py

from __future__ import annotations

from datetime import datetime, timezone
from typing import List

import psycopg

from app.repositories.contratos_repo import ContractRepository
from app.repositories.instalaciones_repo import InstalacionesRepository


class ContractService:
    # Estados (IDs del catálogo)
    BORRADOR = 1
    PENDIENTE_INSTALACION = 2
    ACTIVO = 3
    SUSPENDIDO = 4
    BAJA = 5
    CANCELADO = 6

    def __init__(
        self,
        repo: ContractRepository,
        instalaciones_repo: InstalacionesRepository | None = None,
    ):
        self.repo = repo
        self.instalaciones_repo = instalaciones_repo

    # ==========================================================
    # CREATE
    # ==========================================================

    def create_contract(self, cliente_id: int, domicilio_id: int, plan_id: int) -> dict:
        now = datetime.now(timezone.utc)
        return self.repo.create(
            cliente_id=cliente_id,
            domicilio_id=domicilio_id,
            plan_id=plan_id,
            fecha_inicio=now,
            estado_contrato_id=self.BORRADOR,
        )

    # ==========================================================
    # READ
    # ==========================================================

    def get_contract(self, contrato_id: int) -> dict:
        contrato = self.repo.get_by_id(contrato_id)
        if not contrato:
            raise ValueError("Contrato no encontrado.")
        return contrato

    def list_by_cliente(self, cliente_id: int) -> List[dict]:
        return self.repo.get_by_cliente(cliente_id)

    # ==========================================================
    # ACTIVATE / RESUME
    # ==========================================================

    def _validar_no_solapamiento_activo_mismo_domicilio(self, contrato: dict) -> None:
        if contrato.get("domicilio_id") is None:
            raise ValueError("Contrato inválido: falta domicilio_id.")

        if self.repo.exists_other_active_overlapping_by_domicilio(
            domicilio_id=int(contrato["domicilio_id"]),
            fecha_inicio=contrato["fecha_inicio_contrato"],
            fecha_fin=contrato.get("fecha_fin_contrato"),
            exclude_contrato_id=int(contrato["contrato_id"]),
        ):
            raise ValueError("Ya existe un contrato ACTIVO vigente para ese domicilio.")

    def activate(self, contrato_id: int) -> None:
        contrato = self.get_contract(contrato_id)

        if contrato["estado_contrato_id"] not in (self.BORRADOR, self.PENDIENTE_INSTALACION):
            raise ValueError("El contrato no puede activarse desde su estado actual.")

        self._validar_no_solapamiento_activo_mismo_domicilio(contrato)

        try:
            self.repo.update_estado(contrato_id, self.ACTIVO, fecha_fin=None)
        except psycopg.errors.ExclusionViolation:
            # defensa extra: por concurrencia o si alguien tocó directo DB
            raise ValueError("Ya existe un contrato ACTIVO vigente para ese domicilio.")

    def suspend(self, contrato_id: int) -> None:
        contrato = self.get_contract(contrato_id)
        if contrato["estado_contrato_id"] != self.ACTIVO:
            raise ValueError("Solo un contrato ACTIVO puede suspenderse.")
        self.repo.update_estado(contrato_id, self.SUSPENDIDO, fecha_fin=None)

    def resume(self, contrato_id: int) -> None:
        contrato = self.get_contract(contrato_id)
        if contrato["estado_contrato_id"] != self.SUSPENDIDO:
            raise ValueError("Solo un contrato SUSPENDIDO puede reanudarse.")

        self._validar_no_solapamiento_activo_mismo_domicilio(contrato)

        try:
            self.repo.update_estado(contrato_id, self.ACTIVO, fecha_fin=None)
        except psycopg.errors.ExclusionViolation:
            raise ValueError("Ya existe un contrato ACTIVO vigente para ese domicilio.")

    # ==========================================================
    # CANCEL / TERMINATE
    # ==========================================================

    def cancel(self, contrato_id: int) -> None:
        contrato = self.get_contract(contrato_id)
        if contrato["estado_contrato_id"] in (self.BAJA, self.CANCELADO):
            raise ValueError("El contrato ya está finalizado.")
        self.repo.update_estado(contrato_id, self.CANCELADO, fecha_fin=datetime.now(timezone.utc))

    def terminate(self, contrato_id: int) -> None:
        contrato = self.get_contract(contrato_id)
        if contrato["estado_contrato_id"] not in (self.ACTIVO, self.SUSPENDIDO):
            raise ValueError("Solo contratos activos o suspendidos pueden darse de baja.")
        self.repo.update_estado(contrato_id, self.BAJA, fecha_fin=datetime.now(timezone.utc))

    # ==========================================================
    # CHANGE PLAN
    # ==========================================================

    def change_plan(self, contrato_id: int, new_plan_id: int) -> dict:
        contrato = self.get_contract(contrato_id)
        if contrato["estado_contrato_id"] not in (self.ACTIVO, self.SUSPENDIDO):
            raise ValueError("Solo contratos activos o suspendidos pueden cambiar de plan.")

        # Cerrar contrato actual (evita solapamiento)
        #self.repo.update_estado(contrato_id, self.BAJA, fecha_fin=datetime.utcnow())
        self.repo.update_estado(
            contrato_id,
            self.BAJA,
            fecha_fin=datetime.now(timezone.utc)
        )

        # Crear nuevo contrato en BORRADOR, mismo domicilio
        nuevo = self.repo.create(
            cliente_id=int(contrato["cliente_id"]),
            domicilio_id=int(contrato["domicilio_id"]),
            plan_id=new_plan_id,
            fecha_inicio=datetime.now(timezone.utc),
            estado_contrato_id=self.BORRADOR,
        )
        return nuevo
    
    def confirmar_condicion_tecnica(
        self,
        contrato_id: int,
        apto: bool,
        fecha_programacion_pinstalacion: datetime | None = None,
        tecnico_pinstalacion: str | None = None,
        notas_pinstalacion: str | None = None,
    ) -> dict:
        if self.instalaciones_repo is None:
            raise ValueError("InstalacionesRepository no configurado en ContractService.")

        contrato = self.repo.get_by_id_for_update(contrato_id)
        if not contrato:
            raise ValueError("Contrato no encontrado.")

        if contrato["estado_contrato_id"] != self.BORRADOR:
            raise ValueError("Solo contratos en BORRADOR pueden confirmar condición técnica.")

        if apto:
            self._validar_no_solapamiento_activo_mismo_domicilio(contrato)
            try:
                self.repo.update_estado_only(contrato_id, self.ACTIVO)
            except psycopg.errors.ExclusionViolation:
                raise ValueError("Ya existe un contrato ACTIVO vigente para ese domicilio.")

            return {
                "contrato_id": contrato_id,
                "estado_contrato_id": self.ACTIVO,
                "programacion_id": None,
            }

        if fecha_programacion_pinstalacion is None:
            raise ValueError(
                "Debe informar fecha_programacion_pinstalacion cuando requiere instalación."
            )

        estado_programacion_id = self.instalaciones_repo.get_estado_programacion_id("PROGRAMADA")
        if estado_programacion_id is None:
            raise ValueError("No existe el estado de programación 'PROGRAMADA'.")

        self.repo.update_estado_only(contrato_id, self.PENDIENTE_INSTALACION)

        programacion = self.instalaciones_repo.create_programacion(
            contrato_id=int(contrato["contrato_id"]),
            domicilio_id=int(contrato["domicilio_id"]),
            fecha_programacion_pinstalacion=fecha_programacion_pinstalacion,
            estado_programacion_id=estado_programacion_id,
            tecnico_pinstalacion=tecnico_pinstalacion,
            notas_pinstalacion=notas_pinstalacion,
        )

        return {
            "contrato_id": contrato_id,
            "estado_contrato_id": self.PENDIENTE_INSTALACION,
            "programacion_id": int(programacion["programacion_id"]),
        }