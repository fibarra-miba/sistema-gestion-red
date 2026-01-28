import psycopg
from typing import Dict, Any


def create_domicilio(
    conn: psycopg.Connection,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    query = """
        INSERT INTO domicilio (
            calle,
            numero,
            piso,
            depto,
            complejo,
            referencias
        )
        VALUES (
            %(calle)s,
            %(numero)s,
            %(piso)s,
            %(depto)s,
            %(complejo)s,
            %(referencias)s
        )
        RETURNING domicilio_id;
    """
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(
            query,
            {
                "calle": data.get("calle"),
                "numero": data.get("numero"),
                "piso": data.get("piso"),
                "depto": data.get("depto"),
                "complejo": data.get("complejo"),
                "referencias": data.get("referencias"),
            }
        )
        return cur.fetchone()

