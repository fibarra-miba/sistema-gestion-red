from typing import Optional, Dict, Any, List
import psycopg

def list_clientes(
    conn: psycopg.Connection,
    limit: int = 50,
    offset: int = 0
) -> List[Dict[str, Any]]:
    query = """
        SELECT
            cliente_id,
            nombre_cliente,
            apellido_cliente,
            dni_cliente,
            telefono_cliente,
            email_cliente,
            fecha_alta_cliente,
            estado_cliente_id,
            observacion_cliente
        FROM clientes
        ORDER BY cliente_id
        LIMIT %s OFFSET %s
    """
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(query, (limit, offset))
        return cur.fetchall()


def get_cliente_by_id(
    conn: psycopg.Connection,
    cliente_id: int
) -> Optional[Dict[str, Any]]:
    query = """
        SELECT
            cliente_id,
            nombre_cliente,
            apellido_cliente,
            dni_cliente,
            telefono_cliente,
            email_cliente,
            fecha_alta_cliente,
            estado_cliente_id,
            observacion_cliente
        FROM clientes
        WHERE cliente_id = %s
    """
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(query, (cliente_id,))
        return cur.fetchone()


def create_cliente(
    conn: psycopg.Connection,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    query = """
        INSERT INTO clientes (
            nombre_cliente,
            apellido_cliente,
            dni_cliente,
            telefono_cliente,
            email_cliente,
            fecha_alta_cliente,
            estado_cliente_id,
            observacion_cliente
        )
        VALUES (
            %(nombre_cliente)s,
            %(apellido_cliente)s,
            %(dni_cliente)s,
            %(telefono_cliente)s,
            %(email_cliente)s,
            NOW(),
            %(estado_cliente_id)s,
            %(observacion_cliente)s
        )
        RETURNING
            cliente_id,
            nombre_cliente,
            apellido_cliente,
            dni_cliente,
            telefono_cliente,
            email_cliente,
            fecha_alta_cliente,
            estado_cliente_id,
            observacion_cliente;
    """
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(query, data)
        return cur.fetchone()

