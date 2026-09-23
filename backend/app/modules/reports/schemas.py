from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.core.time import UtcDatetime
from app.modules.audit.models import NivelRiesgo
from app.modules.reports.models import EstadoInforme, FormatoInforme, PrioridadRecomendacion
from app.modules.simulation.models import Criticidad


class RecomendacionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    descripcion: str
    prioridad: PrioridadRecomendacion


class VulnerabilidadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    descripcion: str
    criticidad: Criticidad
    objetivo_descripcion: str | None
    recomendaciones: list[RecomendacionOut]


class InformeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    auditoria_id: int
    estado: EstadoInforme
    formato: FormatoInforme
    fecha_generacion: UtcDatetime
    fecha_validacion: UtcDatetime | None
    vulnerabilidades: list[VulnerabilidadOut] = []


class DashboardAtaque(BaseModel):
    ataque: str
    nivel_riesgo: NivelRiesgo
    impacto_tecnico: Decimal
    impacto_operacional: Decimal
    impacto_financiero: Decimal
    vulnerabilidades: int


class DashboardOut(BaseModel):
    """RF-08: métricas consolidadas, solo para el plan COMPLETO (RN-03)."""

    auditoria_id: int
    impacto_financiero_total: Decimal
    moneda: str
    riesgo_maximo: NivelRiesgo
    por_ataque: list[DashboardAtaque]
