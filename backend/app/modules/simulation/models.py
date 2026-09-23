import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Criticidad(enum.StrEnum):
    BAJA = "BAJA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"
    CRITICA = "CRITICA"


class EmpresaSimulada(Base):
    """ER 4.3 — Réplica virtual generada por el Agente de IA."""

    __tablename__ = "empresa_simulada"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    empresa_cliente_id: Mapped[int] = mapped_column(ForeignKey("empresa_cliente.id"))
    nombre_generado: Mapped[str] = mapped_column(String(200))
    sector_simulado: Mapped[str | None] = mapped_column(String(100))
    plantilla_referencia: Mapped[str | None] = mapped_column(String(100))
    fecha_generacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    activos: Mapped[list["ActivoSimulado"]] = relationship(
        back_populates="empresa_simulada", cascade="all, delete-orphan"
    )


class ActivoSimulado(Base):
    """ER 4.4 — Elemento de la empresa simulada expuesto a los ataques."""

    __tablename__ = "activo_simulado"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    empresa_simulada_id: Mapped[int] = mapped_column(ForeignKey("empresa_simulada.id"))
    tipo: Mapped[str] = mapped_column(String(100))
    nombre: Mapped[str] = mapped_column(String(150))
    ip_simulada: Mapped[str | None] = mapped_column(String(45))
    sistema_operativo: Mapped[str | None] = mapped_column(String(100))
    criticidad: Mapped[Criticidad] = mapped_column(Enum(Criticidad))

    empresa_simulada: Mapped[EmpresaSimulada] = relationship(back_populates="activos")
