from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedException

async def authenticate_user(db: AsyncSession, phone: str, password: str) -> User | None:
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalars().first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

async def create_user_tokens(user: User) -> dict:
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token}

async def refresh_access_token(db: AsyncSession, refresh_token: str) -> dict:
    from app.core.security import decode_token
    payload = decode_token(refresh_token)
    if not payload:
        raise UnauthorizedException(detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise UnauthorizedException(detail="User not found")
        
    return await create_user_tokens(user)

async def change_password(db: AsyncSession, user: User, old_password: str, new_password: str) -> None:
    if not verify_password(old_password, user.password_hash):
        raise UnauthorizedException(detail="Incorrect old password")
    
    user.password_hash = get_password_hash(new_password)
    db.add(user)
    await db.commit()
