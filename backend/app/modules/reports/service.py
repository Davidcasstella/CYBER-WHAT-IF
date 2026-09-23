from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.core.time import utcnow
from app.modules.audit.models import Auditoria, NivelRiesgo
from app.modules.commercial.models import Contratacion, TipoPlan
from app.modules.identity.models import Rol, Usuario
from app.modules.reports.models import EstadoInforme, Informe
from app.modules.reports.schemas import (
    DashboardAtaque,
    DashboardOut,
    InformeOut,
    VulnerabilidadOut,
)

_ORDEN_RIESGO = list(NivelRiesgo)


def create_draft_report(db: Session, auditoria: Auditoria) -> Informe:
    """RF-07: todo informe nace como BORRADOR hasta que un Analista lo valida (RN-04)."""
    informe = Informe(auditoria_id=auditoria.id)
    db.add(informe)
    return informe


def _get_report(db: Session, auditoria_id: int) -> Informe:
    informe = db.scalar(select(Informe).where(Informe.auditoria_id == auditoria_id))
    if informe is None:
        raise NotFoundError("Esta auditoría aún no tiene informe")
    return informe


def get_report(db: Session, user: Usuario, auditoria: Auditoria) -> InformeOut:
    informe = _get_report(db, auditoria.id)
    if user.rol == Rol.CLIENTE and informe.estado != EstadoInforme.VALIDADO:
        # RN-04: el Cliente no ve borradores.
        raise NotFoundError("Tu informe está en revisión por un analista")

    out = InformeOut.model_validate(informe)
    out.vulnerabilidades = [
        VulnerabilidadOut.model_validate(v)
        for ejecucion in auditoria.ejecuciones
        for v in ejecucion.vulnerabilidades
    ]
    return out


def validate_report(db: Session, analista: Usuario, auditoria: Auditoria) -> Informe:
    """RF-09."""
    informe = _get_report(db, auditoria.id)
    if informe.estado == EstadoInforme.VALIDADO:
        raise BusinessRuleError("El informe ya fue validado")
    informe.estado = EstadoInforme.VALIDADO
    informe.validado_por_usuario_id = analista.id
    informe.fecha_validacion = utcnow()
    db.commit()
    return informe


def build_dashboard(db: Session, user: Usuario, auditoria: Auditoria) -> DashboardOut:
    contratacion = db.get(Contratacion, auditoria.contratacion_id)
    assert contratacion is not None
    if user.rol == Rol.CLIENTE:
        if contratacion.plan.tipo != TipoPlan.COMPLETO:
            raise BusinessRuleError(
                "El dashboard está incluido solo en el paquete completo"
            )  # RN-03
        if _get_report(db, auditoria.id).estado != EstadoInforme.VALIDADO:
            raise NotFoundError("Tu informe está en revisión por un analista")  # RN-04

    por_ataque = [
        DashboardAtaque(
            ataque=e.ataque.nombre,
            nivel_riesgo=e.resultado.nivel_riesgo,
            impacto_tecnico=e.resultado.impacto_tecnico or Decimal(0),
            impacto_operacional=e.resultado.impacto_operacional or Decimal(0),
            impacto_financiero=e.resultado.impacto_financiero or Decimal(0),
            vulnerabilidades=len(e.vulnerabilidades),
        )
        for e in auditoria.ejecuciones
        if e.resultado is not None
    ]
    if not por_ataque:
        raise NotFoundError("La auditoría aún no tiene resultados")

    return DashboardOut(
        auditoria_id=auditoria.id,
        impacto_financiero_total=sum((a.impacto_financiero for a in por_ataque), Decimal(0)),
        moneda="COP",
        riesgo_maximo=max((a.nivel_riesgo for a in por_ataque), key=_ORDEN_RIESGO.index),
        por_ataque=por_ataque,
    )
