import psycopg

def create_cliente_domicilio(
    conn: psycopg.Connection,
    cliente_id: int,
    domicilio_id: int
):
    query = """
        INSERT INTO cliente_domicilio (
            cliente_id,
            domicilio_id,
            fecha_desde_clidom
        )
        VALUES (%s, %s, NOW());
    """
    with conn.cursor() as cur:
        cur.execute(query, (cliente_id, domicilio_id))

