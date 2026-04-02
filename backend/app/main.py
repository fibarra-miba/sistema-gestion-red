from fastapi import FastAPI
from app.routes.clientes import router as clientes_router
from app.routes.contratos import router as contratos_router
from app.routes.pagos import router as pagos_router
from app.routes.catalogos import router as catalogos_router
from app.routes.instalaciones import router as instalaciones_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sistema RED API")

origins = [
    "http://localhost:5173",  # tu frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(clientes_router)
app.include_router(contratos_router)
app.include_router(pagos_router)
app.include_router(catalogos_router)
app.include_router(instalaciones_router)
