"""Garantía de aislamiento (RN-01, RF-05, RNF-06).

Toda IP de una empresa simulada debe pertenecer a TEST-NET-2 (RFC 5737), un rango
reservado para documentación que no es enrutable en Internet. El motor de auditoría
llama a `assert_isolated` antes de ejecutar cualquier ataque: si un activo apunta
fuera de este rango, la auditoría se aborta.
"""

import ipaddress

from app.core.exceptions import BusinessRuleError
from app.modules.simulation.models import EmpresaSimulada

SIMULATED_NETWORK = ipaddress.ip_network("198.51.100.0/24")


def assert_isolated(empresa: EmpresaSimulada) -> None:
    for activo in empresa.activos:
        if activo.ip_simulada is None:
            continue
        if ipaddress.ip_address(activo.ip_simulada) not in SIMULATED_NETWORK:
            raise BusinessRuleError(
                f"RN-01: el activo '{activo.nombre}' ({activo.ip_simulada}) está fuera "
                f"de la red simulada {SIMULATED_NETWORK}. Auditoría abortada."
            )
