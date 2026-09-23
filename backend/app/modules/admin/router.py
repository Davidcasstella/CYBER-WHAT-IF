"""Módulo de Administración (RF-12). No tiene modelos propios: orquesta los de otros módulos."""

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, require_roles
from app.modules.identity import service as identity_service
from app.modules.identity.models import Rol
from app.modules.identity.schemas import UsuarioCreate, UsuarioOut

router = APIRouter(
    prefix="/admin",
    tags=["Administración"],
    dependencies=[Depends(require_roles(Rol.ADMIN))],
)


@router.get("/usuarios", response_model=list[UsuarioOut])
def list_users(db: DbSession) -> object:
    return identity_service.list_users(db)


@router.post("/usuarios", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_user(db: DbSession, data: UsuarioCreate) -> object:
    """Alta de Analistas y otros Admin (los Clientes se registran solos)."""
    return identity_service.create_user(db, **data.model_dump())
