from app.modules.audit.attacks.base import AttackOutcome, AttackScenario, Finding
from app.modules.audit.attacks.registry import register
from app.modules.simulation.models import Criticidad, EmpresaSimulada


@register
class CredentialTheftScenario(AttackScenario):
    """MITRE ATT&CK T1110 — Brute Force / robo de credenciales.

    TODO: considerar política de contraseñas y MFA declaradas por el cliente.
    """

    key = "ROBO_CREDENCIALES"
    mitre_technique = "T1110"

    def simulate(self, empresa: EmpresaSimulada, cantidad_empleados: int) -> AttackOutcome:
        objetivo = next((a for a in empresa.activos if a.tipo == "SERVICIO"), None)
        findings = []
        if objetivo is not None:
            findings.append(
                Finding(
                    descripcion="Credenciales válidas obtenidas por fuerza bruta sobre el correo.",
                    criticidad=Criticidad.CRITICA,
                    activo=objetivo,
                    recomendaciones=[
                        "Exigir autenticación multifactor (MFA) en todos los accesos externos.",
                        "Bloquear la cuenta tras intentos fallidos consecutivos.",
                    ],
                )
            )
        return AttackOutcome(
            findings=findings,
            tasa_exito=0.45,
            activos_comprometidos=len(findings),
            horas_interrupcion=8,
        )
