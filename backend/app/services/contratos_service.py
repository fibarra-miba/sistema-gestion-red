# app/services/contract_service.py

from datetime import datetime
from typing import List

from app.repositories.contrato_repo import ContractRepository


class ContractService:

    # Estados (IDs del catálogo)
    BORRADOR = 1
    PENDIENTE_INSTALACION = 2
    ACTIVO = 3
    SUSPENDIDO = 4
    BAJA = 5
    CANCELADO = 6

    def __init__(self, repo: ContractRepository):
        self.repo = repo

    # ==========================================================
    # CREATE
    # ==========================================================

    def create_contract(self, cliente_id: int, plan_id: int) -> dict:

#       if self.repo.exists_active_by_cliente(cliente_id):
#          raise ValueError("El cliente ya posee un contrato activo.")

        now = datetime.utcnow()

        contrato = self.repo.create(
            cliente_id=cliente_id,
            plan_id=plan_id,
            fecha_inicio=now,
            estado_contrato_id=self.BORRADOR,
        )

        return contrato

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
    # ACTIVATE
    # ==========================================================

    def activate(self, contrato_id: int) -> None:

        contrato = self.get_contract(contrato_id)

        if contrato["estado_contrato_id"] not in (
            self.BORRADOR,
            self.PENDIENTE_INSTALACION,
        ):
            raise ValueError("El contrato no puede activarse desde su estado actual.")

    #    if self.repo.exists_active_by_cliente(contrato["cliente_id"]):
    #        raise ValueError("El cliente ya posee un contrato activo.")

        if self.repo.exists_other_active_by_cliente(contrato["cliente_id"], exclude_contrato_id=contrato_id):
            raise ValueError("El cliente ya posee un contrato activo.")

        self.repo.update_estado(
            contrato_id,
            self.ACTIVO,
            fecha_fin=None,
        )

    # ==========================================================
    # SUSPEND
    # ==========================================================

    def suspend(self, contrato_id: int) -> None:

        contrato = self.get_contract(contrato_id)

        if contrato["estado_contrato_id"] != self.ACTIVO:
            raise ValueError("Solo un contrato ACTIVO puede suspenderse.")

        self.repo.update_estado(
            contrato_id,
            self.SUSPENDIDO,
            fecha_fin=None,
        )

    # ==========================================================
    # RESUME
    # ==========================================================

    def resume(self, contrato_id: int) -> None:

        contrato = self.get_contract(contrato_id)

        if contrato["estado_contrato_id"] != self.SUSPENDIDO:
            raise ValueError("Solo un contrato SUSPENDIDO puede reanudarse.")

    #    if self.repo.exists_active_by_cliente(contrato["cliente_id"]):
    #        raise ValueError("El cliente ya posee un contrato activo.")

        if self.repo.exists_other_active_by_cliente(contrato["cliente_id"], exclude_contrato_id=contrato_id):
            raise ValueError("El cliente ya posee un contrato activo.")

        self.repo.update_estado(
            contrato_id,
            self.ACTIVO,
            fecha_fin=None,
        )

    # ==========================================================
    # CANCEL
    # ==========================================================

    def cancel(self, contrato_id: int) -> None:

        contrato = self.get_contract(contrato_id)

        if contrato["estado_contrato_id"] in (
            self.BAJA,
            self.CANCELADO,
        ):
            raise ValueError("El contrato ya está finalizado.")

        self.repo.update_estado(
            contrato_id,
            self.CANCELADO,
            fecha_fin=datetime.utcnow(),
        )

    # ==========================================================
    # TERMINATE (BAJA)
    # ==========================================================

    def terminate(self, contrato_id: int) -> None:

        contrato = self.get_contract(contrato_id)

        if contrato["estado_contrato_id"] not in (
            self.ACTIVO,
            self.SUSPENDIDO,
        ):
            raise ValueError("Solo contratos activos o suspendidos pueden darse de baja.")

        self.repo.update_estado(
            contrato_id,
            self.BAJA,
            fecha_fin=datetime.utcnow(),
        )

    # ==========================================================
    # CHANGE PLAN
    # ==========================================================

    def change_plan(self, contrato_id: int, new_plan_id: int) -> dict:

        contrato = self.get_contract(contrato_id)

        if contrato["estado_contrato_id"] not in (
            self.ACTIVO,
            self.SUSPENDIDO,
        ):
            raise ValueError("Solo contratos activos o suspendidos pueden cambiar de plan.")

        # Cerrar contrato actual
        self.repo.update_estado(
            contrato_id,
            self.BAJA,
            fecha_fin=datetime.utcnow(),
        )

        # Crear nuevo contrato
        nuevo = self.repo.create(
            cliente_id=contrato["cliente_id"],
            plan_id=new_plan_id,
            fecha_inicio=datetime.utcnow(),
            estado_contrato_id=self.BORRADOR,
        )

        return nuevo