# app/repositories/contract_repository.py

from typing import Optional, List
from datetime import datetime

import psycopg
from psycopg.rows import dict_row


class ContractRepository:

    def __init__(self, conn: psycopg.Connection):
        self.conn = conn

    # ==========================================================
    # CREATE
    # ==========================================================

    def create(
        self,
        cliente_id: int,
        plan_id: int,
        fecha_inicio: datetime,
        estado_contrato_id: int,
    ) -> dict:

        query = """
            INSERT INTO contratos (
                cliente_id,
                plan_id,
                fecha_inicio_contrato,
                estado_contrato_id
            )
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """

        with self.conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                query,
                (cliente_id, plan_id, fecha_inicio, estado_contrato_id),
            )
            return cur.fetchone()

    # ==========================================================
    # READ
    # ==========================================================

    def get_by_id(self, contrato_id: int) -> Optional[dict]:

        query = """
            SELECT *
            FROM contratos
            WHERE contrato_id = %s
        """

        with self.conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, (contrato_id,))
            return cur.fetchone()

    def get_by_cliente(self, cliente_id: int) -> List[dict]:

        query = """
            SELECT *
            FROM contratos
            WHERE cliente_id = %s
            ORDER BY fecha_inicio_contrato DESC
        """

        with self.conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, (cliente_id,))
            return cur.fetchall()

    def exists_active_by_cliente(self, cliente_id: int) -> bool:

        query = """
            SELECT 1
            FROM contratos
            WHERE cliente_id = %s
            AND estado_contrato_id = 3
            LIMIT 1
        """

        with self.conn.cursor() as cur:
            cur.execute(query, (cliente_id,))
            return cur.fetchone() is not None

    def exists_other_active_by_cliente(self, cliente_id: int, exclude_contrato_id: int) -> bool:
        query = """
            SELECT 1
            FROM contratos
            WHERE cliente_id = %s
            AND estado_contrato_id = 3
            AND contrato_id <> %s
            LIMIT 1
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (cliente_id, exclude_contrato_id))
            return cur.fetchone() is not None

    # ==========================================================
    # UPDATE ESTADO
    # ==========================================================

    def update_estado(
        self,
        contrato_id: int,
        estado_contrato_id: int,
        fecha_fin: Optional[datetime] = None,
    ) -> None:

        query = """
            UPDATE contratos
            SET estado_contrato_id = %s,
                fecha_fin_contrato = %s
            WHERE contrato_id = %s
        """

        with self.conn.cursor() as cur:
            cur.execute(query, (estado_contrato_id, fecha_fin, contrato_id))

    # ==========================================================
    # UPDATE PLAN (solo usado en change-plan cierre técnico)
    # ==========================================================

    def update_plan(
        self,
        contrato_id: int,
        plan_id: int,
    ) -> None:

        query = """
            UPDATE contratos
            SET plan_id = %s
            WHERE contrato_id = %s
        """

        with self.conn.cursor() as cur:
            cur.execute(query, (plan_id, contrato_id))