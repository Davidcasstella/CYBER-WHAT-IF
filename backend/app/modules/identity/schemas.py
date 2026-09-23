from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.modules.identity.models import Rol


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    correo: str  # salida: no se revalida
    rol: Rol
    empresa_cliente_id: int | None
    activo: bool


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    correo: EmailStr
    contrasena: str = Field(min_length=8, max_length=128)
    rol: Rol
    telefono: str | None = Field(default=None, max_length=20)


class RegistroCliente(BaseModel):
    """Auto-registro público: siempre crea un usuario con rol CLIENTE."""

    nombre: str = Field(min_length=2, max_length=150)
    correo: EmailStr
    contrasena: str = Field(min_length=8, max_length=128)
    telefono: str | None = Field(default=None, max_length=20)
