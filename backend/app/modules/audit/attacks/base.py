"""Contrato común de los ataques predefinidos (patrón Strategy).

Cada ataque recibe la empresa simulada (solo lectura) y devuelve hallazgos y métricas
crudas. No escribe en la BD ni calcula el impacto de negocio: eso lo hacen el motor
(`engine.py`) y la calculadora (`impact.py`), respectivamente.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from app.modules.audit.models import ObjetivoTipo
from app.modules.simulation.models import ActivoSimulado, Criticidad, EmpresaSimulada


@dataclass(frozen=True)
class Finding:
    descripcion: str
    criticidad: Criticidad
    objetivo_tipo: ObjetivoTipo = ObjetivoTipo.ACTIVO
    activo: ActivoSimulado | None = None
    objetivo_descripcion: str | None = None
    cve_referencia: str | None = None
    recomendaciones: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class AttackOutcome:
    findings: list[Finding]
    tasa_exito: float  # 0..1, qué tan lejos llegó el ataque
    activos_comprometidos: int
    horas_interrupcion: int


class AttackScenario(ABC):
    #: Debe coincidir con AtaquePredefinido.tipo en la BD.
    key: str
    mitre_technique: str

    @abstractmethod
    def simulate(self, empresa: EmpresaSimulada, cantidad_empleados: int) -> AttackOutcome: ...
