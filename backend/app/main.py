from fastapi import FastAPI
from app.routes.clientes import router as clientes_router
from app.routes.contratos import router as contratos_router
from app.routes.pagos import router as pagos_router
from app.routes.catalogos import router as catalogos_router

app = FastAPI(title="Sistema RED API")


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(clientes_router)
app.include_router(contratos_router)
app.include_router(pagos_router)
app.include_router(catalogos_router)
