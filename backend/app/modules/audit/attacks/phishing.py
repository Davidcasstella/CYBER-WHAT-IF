from app.modules.audit.attacks.base import AttackOutcome, AttackScenario, Finding
from app.modules.audit.attacks.registry import register
from app.modules.audit.models import ObjetivoTipo
from app.modules.simulation.models import Criticidad, EmpresaSimulada


@register
class PhishingScenario(AttackScenario):
    """MITRE ATT&CK T1566 — Phishing.

    TODO: reemplazar la heurística por un modelo basado en la tasa de clics por sector.
    """

    key = "PHISHING"
    mitre_technique = "T1566"

    def simulate(self, empresa: EmpresaSimulada, cantidad_empleados: int) -> AttackOutcome:
        victimas = max(1, round(cantidad_empleados * 0.3))
        return AttackOutcome(
            findings=[
                Finding(
                    descripcion="Empleados abrieron el enlace de un correo de phishing simulado.",
                    criticidad=Criticidad.ALTA,
                    objetivo_tipo=ObjetivoTipo.PERSONA,
                    objetivo_descripcion=f"{victimas} empleados del área administrativa",
                    recomendaciones=[
                        "Capacitar al personal en identificación de correos sospechosos.",
                        "Activar SPF, DKIM y DMARC en el dominio corporativo.",
                    ],
                )
            ],
            tasa_exito=0.3,
            activos_comprometidos=0,
            horas_interrupcion=2,
        )
