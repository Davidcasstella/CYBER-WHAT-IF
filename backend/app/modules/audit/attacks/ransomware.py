from app.modules.audit.attacks.base import AttackOutcome, AttackScenario, Finding
from app.modules.audit.attacks.registry import register
from app.modules.simulation.models import Criticidad, EmpresaSimulada


@register
class RansomwareScenario(AttackScenario):
    """MITRE ATT&CK T1486 — Data Encrypted for Impact.

    TODO: modelar propagación lateral según segmentación de red y copias de respaldo.
    """

    key = "RANSOMWARE"
    mitre_technique = "T1486"

    def simulate(self, empresa: EmpresaSimulada, cantidad_empleados: int) -> AttackOutcome:
        cifrables = [a for a in empresa.activos if a.tipo in {"SERVIDOR", "ENDPOINT", "BASE_DATOS"}]
        findings = [
            Finding(
                descripcion=f"'{activo.nombre}' fue cifrado sin detección previa.",
                criticidad=activo.criticidad,
                activo=activo,
                recomendaciones=[
                    "Mantener copias de respaldo fuera de línea y probar su restauración."
                ],
            )
            for activo in cifrables
            if activo.criticidad in {Criticidad.ALTA, Criticidad.CRITICA}
        ]
        return AttackOutcome(
            findings=findings,
            tasa_exito=0.6,
            activos_comprometidos=len(cifrables),
            horas_interrupcion=72,
        )
