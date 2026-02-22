from datetime import datetime
from pydantic import BaseModel, Field

class DomicilioCreate(BaseModel):
    complejo: str | None = None
    piso: int | None = None
    depto: str | None = None
    calle: str | None = None
    numero: int | None = None
    referencias: str | None = None
    fecha_desde_dom: datetime | None = Field(default=None)
    fecha_hasta_dom: datetime | None = Field(default=None)
    estado_domicilio: int
