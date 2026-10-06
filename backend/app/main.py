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

    # Static files for medical photos and attachments
    import os
    from fastapi.staticfiles import StaticFiles
    uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    @app.get("/health", tags=["health"])
    async def health_check():
        return {"status": "healthy"}

    @app.on_event("startup")
    async def init_db():
        # Database schema is already provisioned on the VPS
        pass

    return app

app = create_app()
