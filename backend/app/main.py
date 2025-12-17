from fastapi import FastAPI, HTTPException
from app.db import check_database
from app.routes.clientes import router as clientes_router

app = FastAPI(title="Sistema RED API")

@app.get("/health")
def health_check():
    try:
        check_database()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

app.include_router(clientes_router)

