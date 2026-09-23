import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.audit.models import AtaquePredefinido


class TipoPlan(enum.StrEnum):
    INDIVIDUAL = "INDIVIDUAL"
    COMPLETO = "COMPLETO"


class EstadoPago(enum.StrEnum):
    PENDIENTE = "PENDIENTE"
    FORMALIZADO = "FORMALIZADO"
    CANCELADO = "CANCELADO"


class EstadoSolicitud(enum.StrEnum):
    ENVIADA = "ENVIADA"
    RESPONDIDA = "RESPONDIDA"
    CERRADA = "CERRADA"


# ER 4.7 — Tabla de unión N:M Plan_Comercial <-> Ataque_Predefinido
plan_ataque = Table(
    "plan_ataque",
    Base.metadata,
    Column("plan_id", Integer, ForeignKey("plan_comercial.id"), primary_key=True),
    Column("ataque_id", Integer, ForeignKey("ataque_predefinido.id"), primary_key=True),
)


class PlanComercial(Base):
    """ER 4.6 — Modalidad contratable: ataque individual o paquete completo."""

    __tablename__ = "plan_comercial"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100))
    tipo: Mapped[TipoPlan] = mapped_column(Enum(TipoPlan))
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    duracion_dias: Mapped[int | None] = mapped_column(Integer)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, server_default="1")
    descripcion: Mapped[str | None] = mapped_column(String(300))

    ataques: Mapped[list[AtaquePredefinido]] = relationship(secondary=plan_ataque)


class Contratacion(Base):
    """ER 4.8 — Selección de un plan por parte de un Cliente."""

    __tablename__ = "contratacion"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    empresa_cliente_id: Mapped[int] = mapped_column(ForeignKey("empresa_cliente.id"))
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    plan_id: Mapped[int] = mapped_column(ForeignKey("plan_comercial.id"))
    codigo_cupon: Mapped[str | None] = mapped_column(String(30))
    estado_pago: Mapped[EstadoPago] = mapped_column(
        Enum(EstadoPago), default=EstadoPago.PENDIENTE, server_default=EstadoPago.PENDIENTE
    )
    fecha: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_vencimiento: Mapped[datetime | None] = mapped_column(DateTime)

    plan: Mapped[PlanComercial] = relationship()


class SolicitudContactoWhatsApp(Base):
    """ER 4.9 — Registro de la redirección del Cliente a WhatsApp (RF-10)."""

    __tablename__ = "solicitud_contacto_whatsapp"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    contratacion_id: Mapped[int] = mapped_column(ForeignKey("contratacion.id"))
    numero_whatsapp: Mapped[str | None] = mapped_column(String(20))
    fecha: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    estado: Mapped[EstadoSolicitud] = mapped_column(
        Enum(EstadoSolicitud),
        default=EstadoSolicitud.ENVIADA,
        server_default=EstadoSolicitud.ENVIADA,
    )
