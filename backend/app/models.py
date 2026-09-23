"""Importa todos los modelos para que queden registrados en Base.metadata.

Alembic y los tests importan este módulo; así ningún modelo queda fuera por olvido.
"""

from app.modules.audit.models import (
    AtaquePredefinido,
    Auditoria,
    AuditoriaAtaque,
    ResultadoImpacto,
    Vulnerabilidad,
)
from app.modules.clients.models import EmpresaCliente
from app.modules.commercial.models import (
    Contratacion,
    PlanComercial,
    SolicitudContactoWhatsApp,
    plan_ataque,
)
from app.modules.identity.models import Usuario
from app.modules.reports.models import Informe, RecomendacionMitigacion
from app.modules.simulation.models import ActivoSimulado, EmpresaSimulada

__all__ = [
    "ActivoSimulado",
    "AtaquePredefinido",
    "Auditoria",
    "AuditoriaAtaque",
    "Contratacion",
    "EmpresaCliente",
    "EmpresaSimulada",
    "Informe",
    "PlanComercial",
    "RecomendacionMitigacion",
    "ResultadoImpacto",
    "SolicitudContactoWhatsApp",
    "Usuario",
    "Vulnerabilidad",
    "plan_ataque",
]
