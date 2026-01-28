import pytest
from psycopg import Connection

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _count(conn: Connection, table: str) -> int:
    with conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        return cur.fetchone()[0]


# -------------------------------------------------
# Tests
# -------------------------------------------------
@pytest.mark.anyio
async def test_onboarding_ok_crea_todo(client, db_conn):
    payload = {
        "cliente": {
            "nombre": "Juan",
            "apellido": "Perez",
            "dni": "30111222",
            "telefono": "3875550000",
            "email": "juanp@example.com",
            "estado_cliente_id": 1,
            "observacion": "alta test",
        },
        "domicilio": {
            "calle": "Mitre",
            "numero": "123",
            "piso": None,
            "depto": None,
            "localidad": "Salta",
            "provincia": "Salta",
            "codigo_postal": "4400",
        },
        "cuenta": {
            "estado_cuenta_id": 1
        }
    }

    before_clientes = _count(db_conn, "clientes")
    before_dom = _count(db_conn, "domicilio")
    before_cd = _count(db_conn, "cliente_domicilio")
    before_cuenta = _count(db_conn, "cuenta")

    r = await client.post("/clientes/onboarding", json=payload)
    assert r.status_code == 201, r.text

    assert _count(db_conn, "clientes") == before_clientes + 1
    assert _count(db_conn, "domicilio") == before_dom + 1
    assert _count(db_conn, "cliente_domicilio") == before_cd + 1
    assert _count(db_conn, "cuenta") == before_cuenta + 1


@pytest.mark.anyio
async def test_onboarding_duplicado_dni_409_y_no_deja_basura(client, db_conn):
    payload = {
        "cliente": {
            "nombre": "A",
            "apellido": "B",
            "dni": "30999000",
            "telefono": "3875551111",
            "email": "a@b.com",
            "estado_cliente_id": 1,
            "observacion": None,
        },
        "domicilio": {
            "calle": "X",
            "numero": "1",
            "piso": None,
            "depto": None,
            "localidad": "Salta",
            "provincia": "Salta",
            "codigo_postal": "4400",
        },
        "cuenta": {
            "estado_cuenta_id": 1
        }
    }

    r1 = await client.post("/clientes/onboarding", json=payload)
    assert r1.status_code == 201, r1.text

    before_clientes = _count(db_conn, "clientes")
    before_dom = _count(db_conn, "domicilio")
    before_cd = _count(db_conn, "cliente_domicilio")
    before_cuenta = _count(db_conn, "cuenta")

    r2 = await client.post("/clientes/onboarding", json=payload)
    assert r2.status_code == 409, r2.text

    assert _count(db_conn, "clientes") == before_clientes
    assert _count(db_conn, "domicilio") == before_dom
    assert _count(db_conn, "cliente_domicilio") == before_cd
    assert _count(db_conn, "cuenta") == before_cuenta


@pytest.mark.anyio
async def test_onboarding_estado_cliente_invalido_422_y_rollback(client, db_conn):
    payload = {
        "cliente": {
            "nombre": "FK",
            "apellido": "Bad",
            "dni": "30000111",
            "telefono": "3875552222",
            "email": "fk@bad.com",
            "estado_cliente_id": 999999,
            "observacion": None,
        },
        "domicilio": {
            "calle": "Y",
            "numero": "2",
            "piso": None,
            "depto": None,
            "localidad": "Salta",
            "provincia": "Salta",
            "codigo_postal": "4400",
        },
        "cuenta": {
            "estado_cuenta_id": 1
        }
    }

    before_clientes = _count(db_conn, "clientes")
    before_dom = _count(db_conn, "domicilio")
    before_cd = _count(db_conn, "cliente_domicilio")
    before_cuenta = _count(db_conn, "cuenta")

    r = await client.post("/clientes/onboarding", json=payload)
    assert r.status_code in (400, 422), r.text

    assert _count(db_conn, "clientes") == before_clientes
    assert _count(db_conn, "domicilio") == before_dom
    assert _count(db_conn, "cliente_domicilio") == before_cd
    assert _count(db_conn, "cuenta") == before_cuenta


@pytest.mark.anyio
async def test_onboarding_estado_cuenta_invalido_422_y_rollback(client, db_conn):
    payload = {
        "cliente": {
            "nombre": "Cuenta",
            "apellido": "Bad",
            "dni": "30000222",
            "telefono": "3875553333",
            "email": "cuenta@bad.com",
            "estado_cliente_id": 1,
            "observacion": None,
        },
        "domicilio": {
            "calle": "Z",
            "numero": "3",
            "piso": None,
            "depto": None,
            "localidad": "Salta",
            "provincia": "Salta",
            "codigo_postal": "4400",
        },
        "cuenta": {
            "estado_cuenta_id": 999999
        }
    }

    before_clientes = _count(db_conn, "clientes")
    before_dom = _count(db_conn, "domicilio")
    before_cd = _count(db_conn, "cliente_domicilio")
    before_cuenta = _count(db_conn, "cuenta")

    r = await client.post("/clientes/onboarding", json=payload)
    assert r.status_code in (400, 422), r.text

    assert _count(db_conn, "clientes") == before_clientes
    assert _count(db_conn, "domicilio") == before_dom
    assert _count(db_conn, "cliente_domicilio") == before_cd
    assert _count(db_conn, "cuenta") == before_cuenta

