from __future__ import annotations

from datetime import date, datetime
from psycopg import Connection


class PreciosRepo:
    def __init__(self, conn: Connection):
        self.conn = conn

    def get_precio_base_vigente(self, plan_id: int, fecha_emision: date) -> dict | None:
        # Elegir la fila con mayor fecha_desde_pplanes que cumpla vigencia
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT precios_planes_id, precio_mensual_pplanes
                FROM precios_planes
                WHERE plan_id = %s
                  AND activo_pplanes = TRUE
                  AND fecha_desde_pplanes::date <= %s
                  AND (fecha_hasta_pplanes IS NULL OR fecha_hasta_pplanes::date >= %s)
                ORDER BY fecha_desde_pplanes DESC
                LIMIT 1
                """,
                (plan_id, fecha_emision, fecha_emision),
            )
            row = cur.fetchone()
            if not row:
                return None
            return {"precios_planes_id": int(row[0]), "precio": row[1]}