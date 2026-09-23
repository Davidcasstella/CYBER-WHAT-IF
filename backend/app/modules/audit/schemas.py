from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.core.time import UtcDatetime
from app.modules.audit.models import EstadoAuditoria, EstadoEjecucion, NivelRiesgo
from app.modules.reports.models import EstadoInforme


class ResultadoImpactoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    impacto_tecnico: Decimal | None
    impacto_operacional: Decimal | None
    impacto_financiero: Decimal | None
    moneda: str
    nivel_riesgo: NivelRiesgo
    probabilidad_ocurrencia: Decimal | None
    tiempo_recuperacion_horas: int | None


class AtaqueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    tecnica_mitre_principal: str | None


class EjecucionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ataque: AtaqueOut
    estado_ejecucion: EstadoEjecucion
    fecha_ejecucion: UtcDatetime | None
    resultado: ResultadoImpactoOut | None


class InformeResumen(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    estado: EstadoInforme
    fecha_validacion: UtcDatetime | None


class AuditoriaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    contratacion_id: int
    empresa_simulada_id: int
    analista_usuario_id: int | None
    estado: EstadoAuditoria
    fecha_inicio: UtcDatetime | None
    fecha_fin: UtcDatetime | None
    ejecuciones: list[EjecucionOut]
    informe: InformeResumen | None
