from fastapi import FastAPI
from app.routes.clientes import router as clientes_router

app = FastAPI(title="Sistema RED API")


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(clientes_router)

