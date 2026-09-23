from decimal import Decimal

from pydantic import BaseModel

from app.core.time import UtcDatetime
from app.modules.audit.models import EstadoEjecucion, EstadoVulnerabilidad, NivelRiesgo
from app.modules.simulation.models import Criticidad


class EmpresaResumen(BaseModel):
    razon_social: str
    sector: str | None
    cantidad_empleados: int | None


class AuditoriaResumen(BaseModel):
    id: int
    fecha_actualizacion: UtcDatetime | None
    plan_completo: bool


class Dimensiones(BaseModel):
    """Las 4 dimensiones de impacto en escala 0..100."""

    tecnico: int
    operacional: int
    financiero: int
    riesgo: int


class PuntoHistorial(BaseModel):
    auditoria_id: int
    fecha: UtcDatetime | None
    riesgo_general: int
    vulnerabilidades: int
    impacto_financiero: Decimal
    ataques_evaluados: int
    dimensiones: Dimensiones


class Escenario(BaseModel):
    ataque: str
    descripcion: str | None
    estado_ejecucion: EstadoEjecucion
    nivel_riesgo: NivelRiesgo | None


class Hallazgo(BaseModel):
    id: int
    descripcion: str
    escenario: str
    criticidad: Criticidad
    estado: EstadoVulnerabilidad


class ResumenOut(BaseModel):
    """Panel del Cliente.

    Métricas solo del paquete completo (RN-03) y de informes validados (RN-04).
    """

    empresa: EmpresaResumen | None
    auditoria_actual: AuditoriaResumen | None
    auditorias_en_revision: int
    incluye_dashboard: bool
    moneda: str = "COP"
    #: Del más antiguo al más reciente. El último es la auditoría actual; el penúltimo, la anterior.
    historial: list[PuntoHistorial]
    escenarios: list[Escenario]
    hallazgos: list[Hallazgo]
