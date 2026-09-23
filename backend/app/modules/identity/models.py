import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Rol(enum.StrEnum):
    ADMIN = "ADMIN"
    ANALISTA = "ANALISTA"
    CLIENTE = "CLIENTE"


class Usuario(Base):
    """ER 4.1 — Persona con acceso al sistema. Si rol = CLIENTE, pertenece a una Empresa_Cliente."""

    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150))
    correo: Mapped[str] = mapped_column(String(150), unique=True)
    contrasena_hash: Mapped[str] = mapped_column(String(255))
    rol: Mapped[Rol] = mapped_column(Enum(Rol))
    empresa_cliente_id: Mapped[int | None] = mapped_column(ForeignKey("empresa_cliente.id"))
    telefono: Mapped[str | None] = mapped_column(String(20))
    ultimo_acceso: Mapped[datetime | None] = mapped_column(DateTime)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, server_default="1")
    fecha_registro: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
