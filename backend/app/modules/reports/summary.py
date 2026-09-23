"""Resumen del panel del Cliente (RF-08, RF-11).

Solo cuenta auditorías con informe VALIDADO (RN-04). El historial y las métricas de
impacto se calculan sobre auditorías del paquete completo (RN-03): comparar un ataque
suelto contra tres ataques no sería una comparación justa.
"""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.audit.impact import AttackResult, summarize
from app.modules.audit.models import Auditoria, AuditoriaAtaque
from app.modules.clients.models import EmpresaCliente
from app.modules.commercial.models import Contratacion, TipoPlan
from app.modules.identity.models import Usuario
from app.modules.reports.models import EstadoInforme, Informe
from app.modules.reports.summary_schemas import (
    AuditoriaResumen,
    Dimensiones,
    EmpresaResumen,
    Escenario,
    Hallazgo,
    PuntoHistorial,
    ResumenOut,
)
from app.modules.simulation.models import Criticidad, EmpresaSimulada

_ORDEN_CRITICIDAD = list(Criticidad)
MAX_HALLAZGOS = 5


def _client_audits(db: Session, empresa_id: int) -> list[Auditoria]:
    return list(
        db.scalars(
            select(Auditoria)
            .join(EmpresaSimulada)
            .where(EmpresaSimulada.empresa_cliente_id == empresa_id)
            .options(
                selectinload(Auditoria.ejecuciones).selectinload(AuditoriaAtaque.ataque),
                selectinload(Auditoria.ejecuciones).selectinload(AuditoriaAtaque.resultado),
                selectinload(Auditoria.ejecuciones).selectinload(AuditoriaAtaque.vulnerabilidades),
            )
            .order_by(Auditoria.fecha_fin, Auditoria.id)
        )
    )


def _point(auditoria: Auditoria, empleados: int) -> PuntoHistorial:
    resultados = [
        AttackResult(
            impacto_tecnico=e.resultado.impacto_tecnico or Decimal(0),
            impacto_operacional=e.resultado.impacto_operacional or Decimal(0),
            impacto_financiero=e.resultado.impacto_financiero or Decimal(0),
            nivel_riesgo=e.resultado.nivel_riesgo,
        )
        for e in auditoria.ejecuciones
        if e.resultado is not None
    ]
    scores = summarize(resultados, empleados)
    return PuntoHistorial(
        auditoria_id=auditoria.id,
        fecha=auditoria.fecha_fin,
        riesgo_general=scores.riesgo_general,
        vulnerabilidades=sum(len(e.vulnerabilidades) for e in auditoria.ejecuciones),
        impacto_financiero=sum((r.impacto_financiero for r in resultados), Decimal(0)),
        ataques_evaluados=len(resultados),
        dimensiones=Dimensiones(
            tecnico=scores.tecnico,
            operacional=scores.operacional,
            financiero=scores.financiero,
            riesgo=scores.riesgo,
        ),
    )


def build_summary(db: Session, user: Usuario) -> ResumenOut:
    empresa = db.get(EmpresaCliente, user.empresa_cliente_id) if user.empresa_cliente_id else None
    if empresa is None:
        return ResumenOut(
            empresa=None,
            auditoria_actual=None,
            auditorias_en_revision=0,
            incluye_dashboard=False,
            historial=[],
            escenarios=[],
            hallazgos=[],
        )

    audits = _client_audits(db, empresa.id)
    validated_ids = set(
        db.scalars(
            select(Informe.auditoria_id).where(
                Informe.auditoria_id.in_([a.id for a in audits]),
                Informe.estado == EstadoInforme.VALIDADO,
            )
        )
    )
    completo_ids = set(
        db.scalars(
            select(Auditoria.id)
            .join(Contratacion, Auditoria.contratacion_id == Contratacion.id)
            .where(
                Auditoria.id.in_([a.id for a in audits]),
                Contratacion.plan.has(tipo=TipoPlan.COMPLETO),
            )
        )
    )
    visible = [a for a in audits if a.id in validated_ids]
    en_revision = sum(1 for a in audits if a.id not in validated_ids)
    actual = visible[-1] if visible else None
    incluye_dashboard = actual is not None and actual.id in completo_ids
    empleados = empresa.cantidad_empleados or 10

    return ResumenOut(
        empresa=EmpresaResumen(
            razon_social=empresa.razon_social,
            sector=empresa.sector,
            cantidad_empleados=empresa.cantidad_empleados,
        ),
        auditoria_actual=(
            AuditoriaResumen(
                id=actual.id,
                fecha_actualizacion=actual.fecha_fin,
                plan_completo=actual.id in completo_ids,
            )
            if actual
            else None
        ),
        auditorias_en_revision=en_revision,
        incluye_dashboard=incluye_dashboard,
        historial=(
            [_point(a, empleados) for a in visible if a.id in completo_ids]
            if incluye_dashboard
            else []
        ),
        escenarios=[
            Escenario(
                ataque=e.ataque.nombre,
                descripcion=e.ataque.descripcion,
                estado_ejecucion=e.estado_ejecucion,
                nivel_riesgo=e.resultado.nivel_riesgo if e.resultado else None,
            )
            for e in (actual.ejecuciones if actual else [])
        ],
        hallazgos=_top_findings(actual) if actual else [],
    )


def _top_findings(auditoria: Auditoria) -> list[Hallazgo]:
    hallazgos = [
        Hallazgo(
            id=v.id,
            descripcion=v.descripcion,
            escenario=e.ataque.nombre,
            criticidad=v.criticidad,
            estado=v.estado,
        )
        for e in auditoria.ejecuciones
        for v in e.vulnerabilidades
    ]
    hallazgos.sort(key=lambda h: _ORDEN_CRITICIDAD.index(h.criticidad), reverse=True)
    return hallazgos[:MAX_HALLAZGOS]
