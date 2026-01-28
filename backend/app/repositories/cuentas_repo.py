import psycopg
from typing import Dict, Any

def create_cuenta(
    conn: psycopg.Connection,
    cliente_id: int,
    estado_cuenta_id: int
) -> Dict[str, Any]:
    query = """
        INSERT INTO cuenta (
            cliente_id,
            estado_cuenta_id,
            saldo_cuenta
        )
        VALUES (%s, %s, 0)
        RETURNING cuenta_id;
    """
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(query, (cliente_id, estado_cuenta_id))
        return cur.fetchone()

