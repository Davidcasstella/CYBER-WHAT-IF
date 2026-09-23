"""Puerto del Agente de IA (RF-02).

El resto del sistema solo conoce `CompanyGenerator`. Cambiar el generador falso por uno
basado en un LLM es escribir otra clase que cumpla este protocolo, sin tocar el motor de
auditoría (RNF-05).
"""

from dataclasses import dataclass, field
from typing import Protocol

from app.modules.simulation.models import Criticidad


@dataclass(frozen=True)
class CompanyParams:
    """Parámetros de negocio que entrega el Cliente o el Analista (RF-01)."""

    razon_social: str
    sector: str | None
    cantidad_empleados: int | None
    dominio_principal: str | None


@dataclass(frozen=True)
class GeneratedAsset:
    tipo: str
    nombre: str
    criticidad: Criticidad
    ip_simulada: str | None = None
    sistema_operativo: str | None = None


@dataclass(frozen=True)
class GeneratedCompany:
    nombre_generado: str
    sector_simulado: str | None
    plantilla_referencia: str
    activos: list[GeneratedAsset] = field(default_factory=list)


class CompanyGenerator(Protocol):
    def generate(self, params: CompanyParams) -> GeneratedCompany: ...
