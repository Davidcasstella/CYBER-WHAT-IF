from collections.abc import Callable
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.modules.identity.models import Rol, Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{get_settings().api_prefix}/auth/login")

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(db: DbSession, token: Annotated[str, Depends(oauth2_scheme)]) -> Usuario:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión inválida o expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError as exc:
        raise unauthorized from exc

    user = db.get(Usuario, int(payload["sub"]))
    if user is None or not user.activo:
        raise unauthorized
    return user


CurrentUser = Annotated[Usuario, Depends(get_current_user)]


def require_roles(*roles: Rol) -> Callable[[Usuario], Usuario]:
    """Control de acceso por rol (RNF-02).

    Uso: `user: Usuario = Depends(require_roles(Rol.ADMIN))`.
    """

    def checker(user: CurrentUser) -> Usuario:
        if user.rol not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tienes permiso para esta acción")
        return user

    return checker
