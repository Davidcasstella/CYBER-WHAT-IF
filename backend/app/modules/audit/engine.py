"""Motor de Auditoría (RF-04, RF-05, RF-06).

Orquesta: aislamiento -> ataque -> impacto -> persistencia de hallazgos -> informe borrador.
Hoy corre de forma síncrona; si supera RNF-01 (5 min) debe moverse a una cola de tareas.
"""

from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError
from app.core.time import utcnow
from app.modules.audit.attacks import get_scenario
from app.modules.audit.impact import calculate_impact
from app.modules.audit.models import (
    Auditoria,
    AuditoriaAtaque,
    EstadoAuditoria,
    EstadoEjecucion,
    ObjetivoTipo,
    ResultadoImpacto,
    Vulnerabilidad,
)
from app.modules.clients.models import EmpresaCliente
from app.modules.reports.models import RecomendacionMitigacion
from app.modules.reports.service import create_draft_report
from app.modules.simulation.models import EmpresaSimulada
from app.modules.simulation.sandbox import assert_isolated


def run_audit(db: Session, auditoria: Auditoria) -> Auditoria:
    if auditoria.estado != EstadoAuditoria.PENDIENTE:
        raise BusinessRuleError("La auditoría ya fue ejecutada o está en curso")

    empresa = db.get(EmpresaSimulada, auditoria.empresa_simulada_id)
    assert empresa is not None
    assert_isolated(empresa)  # RN-01: nunca salir de la red simulada

    cliente = db.get(EmpresaCliente, empresa.empresa_cliente_id)
    empleados = (cliente.cantidad_empleados if cliente else None) or 10

    auditoria.estado = EstadoAuditoria.EN_PROCESO
    auditoria.fecha_inicio = utcnow()
    db.flush()

    for ejecucion in auditoria.ejecuciones:
        _run_attack(ejecucion, empresa, empleados)

    # RN-02: ninguna auditoría puede cerrarse sin impacto calculado en todas sus ejecuciones.
    if any(e.resultado is None for e in auditoria.ejecuciones):
        raise BusinessRuleError("RN-02: hay ataques sin impacto calculado")

    auditoria.estado = EstadoAuditoria.COMPLETADA
    auditoria.fecha_fin = utcnow()
    create_draft_report(db, auditoria)
    db.commit()
    return auditoria


def _run_attack(ejecucion: AuditoriaAtaque, empresa: EmpresaSimulada, empleados: int) -> None:
    if ejecucion.ataque.tipo is None:
        raise BusinessRuleError(f"El ataque '{ejecucion.ataque.nombre}' no tiene tipo configurado")
    scenario = get_scenario(ejecucion.ataque.tipo)
    outcome = scenario.simulate(empresa, empleados)
    impact = calculate_impact(outcome, len(empresa.activos), empleados)

    ejecucion.resultado = ResultadoImpacto(
        impacto_tecnico=impact.impacto_tecnico,
        impacto_operacional=impact.impacto_operacional,
        impacto_financiero=impact.impacto_financiero,
        nivel_riesgo=impact.nivel_riesgo,
        probabilidad_ocurrencia=impact.probabilidad_ocurrencia,
        tiempo_recuperacion_horas=impact.tiempo_recuperacion_horas,
    )
    for finding in outcome.findings:
        vulnerabilidad = Vulnerabilidad(
            descripcion=finding.descripcion,
            criticidad=finding.criticidad,
            objetivo_tipo=finding.objetivo_tipo,
            activo_simulado_id=finding.activo.id if finding.activo else None,
            objetivo_descripcion=finding.objetivo_descripcion,
            cve_referencia=finding.cve_referencia,
            recomendaciones=[
                RecomendacionMitigacion(descripcion=texto) for texto in finding.recomendaciones
            ],
        )
        _check_target(vulnerabilidad)
        ejecucion.vulnerabilidades.append(vulnerabilidad)

    ejecucion.estado_ejecucion = EstadoEjecucion.EJECUTADO
    ejecucion.fecha_ejecucion = utcnow()


def _check_target(v: Vulnerabilidad) -> None:
    """Misma regla que los triggers de la BD; fallar aquí da un error legible."""
    if v.objetivo_tipo == ObjetivoTipo.ACTIVO and v.activo_simulado_id is None:
        raise BusinessRuleError("Una vulnerabilidad de tipo ACTIVO requiere un activo simulado")
    if v.objetivo_tipo == ObjetivoTipo.PERSONA and not v.objetivo_descripcion:
        raise BusinessRuleError("Una vulnerabilidad de tipo PERSONA requiere objetivo_descripcion")
