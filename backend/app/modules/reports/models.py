import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EstadoInforme(enum.StrEnum):
    BORRADOR = "BORRADOR"
    VALIDADO = "VALIDADO"


class FormatoInforme(enum.StrEnum):
    PDF = "PDF"
    HTML = "HTML"


class PrioridadRecomendacion(enum.StrEnum):
    BAJA = "BAJA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"


class EstadoRecomendacion(enum.StrEnum):
    PENDIENTE = "PENDIENTE"
    IMPLEMENTADA = "IMPLEMENTADA"


class RecomendacionMitigacion(Base):
    """ER 4.14 — Sugerencia de remediación en texto asociada a una vulnerabilidad."""

    __tablename__ = "recomendacion_mitigacion"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    vulnerabilidad_id: Mapped[int] = mapped_column(ForeignKey("vulnerabilidad.id"))
    descripcion: Mapped[str] = mapped_column(String(500))
    prioridad: Mapped[PrioridadRecomendacion] = mapped_column(
        Enum(PrioridadRecomendacion),
        default=PrioridadRecomendacion.MEDIA,
        server_default=PrioridadRecomendacion.MEDIA,
    )
    estado: Mapped[EstadoRecomendacion] = mapped_column(
        Enum(EstadoRecomendacion),
        default=EstadoRecomendacion.PENDIENTE,
        server_default=EstadoRecomendacion.PENDIENTE,
    )
    costo_estimado: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))


class Informe(Base):
    """ER 4.15 — Informe de la auditoría. Solo es visible al Cliente si está VALIDADO (RN-04)."""

    __tablename__ = "informe"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    auditoria_id: Mapped[int] = mapped_column(ForeignKey("auditoria.id"), unique=True)
    estado: Mapped[EstadoInforme] = mapped_column(
        Enum(EstadoInforme), default=EstadoInforme.BORRADOR, server_default=EstadoInforme.BORRADOR
    )
    formato: Mapped[FormatoInforme] = mapped_column(
        Enum(FormatoInforme), default=FormatoInforme.PDF, server_default=FormatoInforme.PDF
    )
    idioma: Mapped[str] = mapped_column(String(10), default="es", server_default="es")
    url_descarga: Mapped[str | None] = mapped_column(String(255))
    fecha_generacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    validado_por_usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuario.id"))
    fecha_validacion: Mapped[datetime | None] = mapped_column(DateTime)
