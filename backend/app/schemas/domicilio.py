from pydantic import BaseModel

class DomicilioCreate(BaseModel):
    calle: str
    numero: str
    piso: str | None = None
    departamento: str | None = None
    localidad: str
    provincia: str
    codigo_postal: str
    observaciones: str | None = None

