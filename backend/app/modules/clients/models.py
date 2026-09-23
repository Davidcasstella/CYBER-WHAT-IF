from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EmpresaCliente(Base):
    """ER 4.2 — Organización real que contrata la auditoría. Sus datos son sensibles (RN-05)."""

    __tablename__ = "empresa_cliente"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    razon_social: Mapped[str] = mapped_column(String(200))
    nit: Mapped[str | None] = mapped_column(String(30), unique=True)
    sector: Mapped[str | None] = mapped_column(String(100))
    cantidad_empleados: Mapped[int | None] = mapped_column(Integer)
    dominio_principal: Mapped[str | None] = mapped_column(String(150))
    correo_contacto: Mapped[str | None] = mapped_column(String(150))
    pais: Mapped[str | None] = mapped_column(String(80))
    ciudad: Mapped[str | None] = mapped_column(String(80))
    fecha_registro: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
