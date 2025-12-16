# RED - Sistema de Gestión de Servicio de Internet

Repositorio base para el sistema RED.

## Estructura
- `backend/`: backend en Python (a definir framework).
- `frontend/`: frontend (React).
- `infra/`: infraestructura (Docker Compose, DB, herramientas).
- `docs/`: documentación técnica y funcional.

## Requisitos (desarrollo)
- Ubuntu (VM)
- Git + SSH con GitHub
- Docker + Docker Compose
- PostgreSQL (en Docker) + pgAdmin (en Docker)

## Variables de entorno
Copiar el archivo de ejemplo y ajustar si corresponde:

```bash
cp .env.example .env
