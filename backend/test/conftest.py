import os
import sys
import pathlib
import psycopg
import pytest
from httpx import AsyncClient

# =========================
# Fix PYTHONPATH
# =========================
BASE_DIR = pathlib.Path(__file__).resolve().parents[1]  # /app
sys.path.insert(0, str(BASE_DIR))

from app.main import app  # noqa: E402

# =========================
# SQL paths
# =========================
SQL_DIR = BASE_DIR / "infra" / "sql"

SCHEMA_FILES = [
    SQL_DIR / "001_schema.sql",
    SQL_DIR / "002_constraints.sql",
    SQL_DIR / "003_indexes.sql",
    SQL_DIR / "010_seed.sql",
]

# =========================
# Helpers
# =========================
def _read_sql(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")

def _exec_sql(conn: psycopg.Connection, sql: str) -> None:
    statements = [s.strip() for s in sql.split(";") if s.strip()]
    with conn.cursor() as cur:
        for stmt in statements:
            cur.execute(stmt)

def _recreate_public_schema(conn: psycopg.Connection) -> None:
    with conn.cursor() as cur:
        cur.execute("DROP SCHEMA IF EXISTS public CASCADE;")
        cur.execute("CREATE SCHEMA public;")
        cur.execute("GRANT ALL ON SCHEMA public TO public;")

# =========================
# Fixtures
# =========================
@pytest.fixture(scope="session")
def test_db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL not set")
    return url

@pytest.fixture(scope="function")
def db_conn(test_db_url: str):
    conn = psycopg.connect(test_db_url)
    try:
        _recreate_public_schema(conn)
        for f in SCHEMA_FILES:
            _exec_sql(conn, _read_sql(f))
        conn.commit()
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

@pytest.fixture(scope="function")
async def client(db_conn):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

