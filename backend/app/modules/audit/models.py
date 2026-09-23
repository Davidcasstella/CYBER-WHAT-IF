import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.simulation.models import Criticidad

if TYPE_CHECKING:
    from app.modules.reports.models import RecomendacionMitigacion


class NivelDificultad(enum.StrEnum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"


class EstadoAuditoria(enum.StrEnum):
    PENDIENTE = "PENDIENTE"
    EN_PROCESO = "EN_PROCESO"
    COMPLETADA = "COMPLETADA"


class EstadoEjecucion(enum.StrEnum):
    PENDIENTE = "PENDIENTE"
    EJECUTADO = "EJECUTADO"
    FALLIDO = "FALLIDO"


class NivelRiesgo(enum.StrEnum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"
    URGENTE = "URGENTE"


class ObjetivoTipo(enum.StrEnum):
    ACTIVO = "ACTIVO"
    PERSONA = "PERSONA"


class EstadoVulnerabilidad(enum.StrEnum):
    ABIERTA = "ABIERTA"
    EN_REMEDIACION = "EN_REMEDIACION"
    CERRADA = "CERRADA"


class AtaquePredefinido(Base):
    """ER 4.5 — Catálogo estático: phishing, ransomware, robo de credenciales.

    `tipo` es la clave que enlaza la fila con su implementación en `attacks/registry.py`.
    """

    __tablename__ = "ataque_predefinido"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True)
    tipo: Mapped[str | None] = mapped_column(String(100))
    descripcion: Mapped[str | None] = mapped_column(String(300))
    nivel_dificultad: Mapped[NivelDificultad] = mapped_column(
        Enum(NivelDificultad), default=NivelDificultad.MEDIO, server_default=NivelDificultad.MEDIO
    )
    tecnica_mitre_principal: Mapped[str | None] = mapped_column(String(20))


class Auditoria(Base):
    """ER 4.10 — Ejecución concreta de una auditoría contratada (1:1 con Contratacion)."""

    __tablename__ = "auditoria"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    contratacion_id: Mapped[int] = mapped_column(ForeignKey("contratacion.id"), unique=True)
    empresa_simulada_id: Mapped[int] = mapped_column(ForeignKey("empresa_simulada.id"))
    analista_usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuario.id"))
    estado: Mapped[EstadoAuditoria] = mapped_column(
        Enum(EstadoAuditoria),
        default=EstadoAuditoria.PENDIENTE,
        server_default=EstadoAuditoria.PENDIENTE,
    )
    observaciones: Mapped[str | None] = mapped_column(String(500))
    fecha_inicio: Mapped[datetime | None] = mapped_column(DateTime)
    fecha_fin: Mapped[datetime | None] = mapped_column(DateTime)

    ejecuciones: Mapped[list["AuditoriaAtaque"]] = relationship(
        back_populates="auditoria", cascade="all, delete-orphan"
    )


class AuditoriaAtaque(Base):
    """ER 4.11 — Unión N:M Auditoria <-> Ataque_Predefinido, con estado de ejecución."""

    __tablename__ = "auditoria_ataque"
    __table_args__ = (UniqueConstraint("auditoria_id", "ataque_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    auditoria_id: Mapped[int] = mapped_column(ForeignKey("auditoria.id"))
    ataque_id: Mapped[int] = mapped_column(ForeignKey("ataque_predefinido.id"))
    fecha_ejecucion: Mapped[datetime | None] = mapped_column(DateTime)
    estado_ejecucion: Mapped[EstadoEjecucion] = mapped_column(
        Enum(EstadoEjecucion),
        default=EstadoEjecucion.PENDIENTE,
        server_default=EstadoEjecucion.PENDIENTE,
    )

    auditoria: Mapped[Auditoria] = relationship(back_populates="ejecuciones")
    ataque: Mapped[AtaquePredefinido] = relationship()
    resultado: Mapped["ResultadoImpacto | None"] = relationship(cascade="all, delete-orphan")
    vulnerabilidades: Mapped[list["Vulnerabilidad"]] = relationship(cascade="all, delete-orphan")


class ResultadoImpacto(Base):
    """ER 4.12 — Impacto en 4 dimensiones de una ejecución de ataque (RN-02)."""

    __tablename__ = "resultado_impacto"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    auditoria_ataque_id: Mapped[int] = mapped_column(ForeignKey("auditoria_ataque.id"), unique=True)
    impacto_tecnico: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    impacto_operacional: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    impacto_financiero: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    moneda: Mapped[str] = mapped_column(String(3), default="COP", server_default="COP")
    nivel_riesgo: Mapped[NivelRiesgo] = mapped_column(Enum(NivelRiesgo))
    probabilidad_ocurrencia: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    tiempo_recuperacion_horas: Mapped[int | None] = mapped_column(Integer)
    fecha_calculo: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Vulnerabilidad(Base):
    """ER 4.13 — Debilidad detectada.

    Si objetivo_tipo = ACTIVO exige activo; si PERSONA, exige objetivo_descripcion.

    La regla se aplica en la BD con triggers (ver migración) y también en el dominio.
    """

    __tablename__ = "vulnerabilidad"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    auditoria_ataque_id: Mapped[int] = mapped_column(ForeignKey("auditoria_ataque.id"))
    activo_simulado_id: Mapped[int | None] = mapped_column(ForeignKey("activo_simulado.id"))
    objetivo_tipo: Mapped[ObjetivoTipo] = mapped_column(
        Enum(ObjetivoTipo), default=ObjetivoTipo.ACTIVO, server_default=ObjetivoTipo.ACTIVO
    )
    objetivo_descripcion: Mapped[str | None] = mapped_column(String(200))
    descripcion: Mapped[str] = mapped_column(String(500))
    criticidad: Mapped[Criticidad] = mapped_column(Enum(Criticidad))
    cve_referencia: Mapped[str | None] = mapped_column(String(20))
    estado: Mapped[EstadoVulnerabilidad] = mapped_column(
        Enum(EstadoVulnerabilidad),
        default=EstadoVulnerabilidad.ABIERTA,
        server_default=EstadoVulnerabilidad.ABIERTA,
    )
    fecha_deteccion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Referencia por nombre: el modelo vive en el módulo de informes (app.models registra ambos).
    recomendaciones: Mapped[list["RecomendacionMitigacion"]] = relationship(
        cascade="all, delete-orphan"
    )
