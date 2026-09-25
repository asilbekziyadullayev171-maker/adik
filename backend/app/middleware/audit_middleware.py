from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.services.audit_service import log_action
from app.core.security import decode_token
from app.database import async_session_maker
import uuid

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        if request.method in ["POST", "PUT", "DELETE"]:
            # Extract user if available
            auth = request.headers.get("Authorization")
            user_id = None
            if auth and auth.startswith("Bearer "):
                token = auth.split(" ")[1]
                payload = decode_token(token)
                if payload:
                    user_sub = payload.get("sub")
                    if user_sub:
                        user_id = uuid.UUID(user_sub)

            if user_id:
                async with async_session_maker() as db:
                    await log_action(
                        db=db,
                        user_id=user_id,
                        action=request.method,
                        resource_type=request.url.path,
                        resource_id="",
                        ip_address=request.client.host if request.client else None,
                        user_agent=request.headers.get("user-agent")
                    )
                    
        return response
