"""Importar este paquete registra todos los ataques.

Para añadir un ataque nuevo (RNF-05): crea `mi_ataque.py` con una subclase de
AttackScenario decorada con @register, impórtala aquí y agrega su fila en
ataque_predefinido con el mismo `tipo`. No hace falta tocar el generador de empresas.
"""

from app.modules.audit.attacks import credential_theft, phishing, ransomware
from app.modules.audit.attacks.registry import get_scenario, registered_keys

__all__ = ["credential_theft", "get_scenario", "phishing", "ransomware", "registered_keys"]
