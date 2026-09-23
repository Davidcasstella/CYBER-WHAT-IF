"""Cálculo de impacto en 4 dimensiones (RF-06, RN-02).

Las fórmulas son provisionales y están aisladas aquí para poder calibrarlas sin tocar
los ataques. TODO: documentar los supuestos del modelo (riesgo 7.1 del Aterrizaje).
"""

from dataclasses import dataclass
from decimal import Decimal

from app.modules.audit.attacks.base import AttackOutcome
from app.modules.audit.models import NivelRiesgo
from app.modules.simulation.models import Criticidad

_PESO_CRITICIDAD = {
    Criticidad.BAJA: 1,
    Criticidad.MEDIA: 2,
    Criticidad.ALTA: 3,
    Criticidad.CRITICA: 4,
}

# Costo estimado por hora de interrupción y por empleado, en COP.
COSTO_HORA_POR_EMPLEADO = Decimal("25000")


@dataclass(frozen=True)
class ImpactResult:
    impacto_tecnico: Decimal  # 0..100
    impacto_operacional: Decimal  # 0..100
    impacto_financiero: Decimal  # COP
    nivel_riesgo: NivelRiesgo
    probabilidad_ocurrencia: Decimal  # 0..100
    tiempo_recuperacion_horas: int


def calculate_impact(
    outcome: AttackOutcome, total_activos: int, cantidad_empleados: int
) -> ImpactResult:
    peso = sum(_PESO_CRITICIDAD[f.criticidad] for f in outcome.findings)
    tecnico = min(
        100, peso * 10 + outcome.activos_comprometidos * 100 // max(total_activos, 1) // 2
    )
    operacional = min(100, outcome.horas_interrupcion * 100 // 72)
    financiero = COSTO_HORA_POR_EMPLEADO * cantidad_empleados * outcome.horas_interrupcion
    probabilidad = Decimal(str(round(outcome.tasa_exito * 100, 2)))

    return ImpactResult(
        impacto_tecnico=Decimal(tecnico),
        impacto_operacional=Decimal(operacional),
        impacto_financiero=financiero,
        nivel_riesgo=_nivel_riesgo((tecnico + operacional) / 2 * outcome.tasa_exito),
        probabilidad_ocurrencia=probabilidad,
        tiempo_recuperacion_horas=outcome.horas_interrupcion,
    )


def _nivel_riesgo(score: float) -> NivelRiesgo:
    if score >= 50:
        return NivelRiesgo.URGENTE
    if score >= 30:
        return NivelRiesgo.ALTO
    if score >= 15:
        return NivelRiesgo.MEDIO
    return NivelRiesgo.BAJO


# --- Puntuaciones agregadas para el panel del Cliente (RF-08) ---------------------------

_PUNTAJE_RIESGO = {
    NivelRiesgo.BAJO: 20,
    NivelRiesgo.MEDIO: 45,
    NivelRiesgo.ALTO: 70,
    NivelRiesgo.URGENTE: 90,
}

# Pérdida de referencia: un mes laboral (160 h) de toda la empresa detenida.
HORAS_REFERENCIA_FINANCIERA = 160


@dataclass(frozen=True)
class DimensionScores:
    """Las 4 dimensiones en la misma escala 0..100 (0 = bajo impacto)."""

    tecnico: int
    operacional: int
    financiero: int
    riesgo: int

    @property
    def riesgo_general(self) -> int:
        return round((self.tecnico + self.operacional + self.financiero + self.riesgo) / 4)


@dataclass(frozen=True)
class AttackResult:
    impacto_tecnico: Decimal
    impacto_operacional: Decimal
    impacto_financiero: Decimal
    nivel_riesgo: NivelRiesgo


def summarize(resultados: list[AttackResult], cantidad_empleados: int) -> DimensionScores:
    """Resume los ataques de una auditoría. Provisional, como el resto de este módulo."""
    if not resultados:
        return DimensionScores(0, 0, 0, 0)
    n = len(resultados)
    total_financiero = sum((r.impacto_financiero for r in resultados), Decimal(0))
    referencia = COSTO_HORA_POR_EMPLEADO * max(cantidad_empleados, 1) * HORAS_REFERENCIA_FINANCIERA
    return DimensionScores(
        tecnico=round(sum(r.impacto_tecnico for r in resultados) / n),
        operacional=round(sum(r.impacto_operacional for r in resultados) / n),
        financiero=min(100, round(total_financiero / referencia * 100)),
        riesgo=round(sum(_PUNTAJE_RIESGO[r.nivel_riesgo] for r in resultados) / n),
    )
