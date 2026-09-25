from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

class QishloqMedException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code

class NotFoundException(QishloqMedException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail, error_code="NOT_FOUND")

class UnauthorizedException(QishloqMedException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail, error_code="UNAUTHORIZED")

class ForbiddenException(QishloqMedException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail, error_code="FORBIDDEN")

class ValidationException(QishloqMedException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=422, detail=detail, error_code="VALIDATION_ERROR")

class DuplicateException(QishloqMedException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=409, detail=detail, error_code="DUPLICATE_RESOURCE")

async def qishloqmed_exception_handler(request: Request, exc: QishloqMedException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.error_code, "message": exc.detail}}
    )
