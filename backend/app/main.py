from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.middleware.audit_middleware import AuditMiddleware
from app.database import Base, engine

def create_app() -> FastAPI:
    app = FastAPI(
        title="QishloqMed AI API",
        description="Backend API for QishloqMed AI Triage Platform",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(AuditMiddleware)

    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health", tags=["health"])
    async def health_check():
        return {"status": "healthy"}

    @app.on_event("startup")
    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    return app

app = create_app()
