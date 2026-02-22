import psycopg
from psycopg.errors import UniqueViolation
from typing import Dict, Any

from app.repositories import (
    clientes_repo,
    domicilios_repo,
    cuentas_repo
)


class ClienteService:

    @staticmethod
    def listar(conn: psycopg.Connection, limit: int, offset: int):
        return clientes_repo.list_clientes(conn, limit, offset)

    @staticmethod
    def obtener(conn: psycopg.Connection, cliente_id: int):
        cliente = clientes_repo.get_cliente_by_id(conn, cliente_id)
        if not cliente:
            raise ValueError("CLIENTE_NOT_FOUND")
        return cliente

    @staticmethod
    def crear_cliente(
        conn: psycopg.Connection,
        data: Dict[str, Any]
    ):
        if not data.get("dni"):
            raise ValueError("DNI_REQUIRED")

        data_repo = {
            "nombre_cliente": data.get("nombre"),
            "apellido_cliente": data.get("apellido"),
            "dni_cliente": data.get("dni"),
            "telefono_cliente": data.get("telefono"),
            "email_cliente": data.get("email"),
            "estado_cliente_id": data.get("estado_cliente_id"),
            "observacion_cliente": data.get("observaciones"),
        }

        try:
            return clientes_repo.create_cliente(conn, data_repo)
        except UniqueViolation:
            raise

    @staticmethod
    def onboarding(conn, payload):
        cliente_payload = payload["cliente"]

        cliente_data = {
            "nombre_cliente": cliente_payload.get("nombre"),
            "apellido_cliente": cliente_payload.get("apellido"),
            "dni_cliente": cliente_payload.get("dni"),
            "telefono_cliente": cliente_payload.get("telefono"),
            "email_cliente": cliente_payload.get("email"),
            "estado_cliente_id": cliente_payload.get("estado_cliente_id"),
            "observacion_cliente": cliente_payload.get("observacion"),
        }

        cliente = clientes_repo.create_cliente(conn, cliente_data)
        cliente_id = cliente["cliente_id"]
        domicilio_payload = payload["domicilio"]

        # Si en algún caso el cliente ya pudiera existir con domicilio vigente,
        # cerramos vigentes. Para onboarding puro (cliente nuevo) no afectará nada.
        domicilios_repo.close_domicilios_vigentes(
            conn,
            cliente_id=cliente_id,
            fecha_hasta_dom=domicilio_payload.get("fecha_desde_dom")  # opcional: cierre “hasta” cuando entra el nuevo
        )

        domicilios_repo.create_domicilio(
            conn,
            cliente_id,
            domicilio_payload
        )

        cuentas_repo.create_cuenta(
            conn,
            cliente_id,
            payload["cuenta"]["estado_cuenta_id"]
        )

        return cliente
