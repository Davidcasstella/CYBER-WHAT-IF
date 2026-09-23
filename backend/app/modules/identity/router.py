from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.modules.identity import service
from app.modules.identity.models import Rol
from app.modules.identity.schemas import RegistroCliente, Token, UsuarioOut

router = APIRouter(prefix="/auth", tags=["Identidad"])


@router.post("/login", response_model=Token)
def login(db: DbSession, form: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    """El campo `username` del formulario es el correo (convención OAuth2)."""
    user = service.authenticate(db, form.username, form.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Correo o contraseña incorrectos")
    return Token(access_token=create_access_token(str(user.id), user.rol))


@router.post("/registro", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def register(db: DbSession, data: RegistroCliente) -> object:
    return service.create_user(db, **data.model_dump(), rol=Rol.CLIENTE)


@router.get("/me", response_model=UsuarioOut)
def me(user: CurrentUser) -> object:
    return user
