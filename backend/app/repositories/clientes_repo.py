from typing import Optional, Dict, Any, List
import psycopg
from app.db import get_connection

def list_clientes(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    query = """
        SELECT
            cliente_id,
            nombre,
            apellido,
            dni,
            telefono,
            email,
            fecha_alta,
            estado_cliente_id,
            observaciones
        FROM clientes
        ORDER BY cliente_id
        LIMIT %s OFFSET %s
    """

    with get_connection() as conn:
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(query, (limit, offset))
            return cur.fetchall()

def get_cliente_by_id(cliente_id: int) -> Optional[Dict[str, Any]]:
    query = """
        SELECT
            cliente_id,
            nombre,
            apellido,
            dni,
            telefono,
            email,
            fecha_alta,
            estado_cliente_id,
            observaciones
        FROM clientes
        WHERE cliente_id = %s
    """

    with get_connection() as conn:
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(query, (cliente_id,))
            return cur.fetchone()

def create_cliente(data: Dict[str, Any]) -> Dict[str, Any]:
    query = """
        INSERT INTO clientes (
            nombre,
            apellido,
            dni,
            telefono,
            email,
            fecha_alta,
            estado_cliente_id,
            observaciones
        )
        VALUES (
            %(nombre)s,
            %(apellido)s,
            %(dni)s,
            %(telefono)s,
            %(email)s,
            NOW(),
            %(estado_cliente_id)s,
            %(observaciones)s
        )
        RETURNING
            cliente_id,
            nombre,
            apellido,
            dni,
            telefono,
            email,
            fecha_alta,
            estado_cliente_id,
            observaciones;
    """

    with get_connection() as conn:
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(query, data)
            return cur.fetchone()

