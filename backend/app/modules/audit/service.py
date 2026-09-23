from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.modules.audit.models import Auditoria, AuditoriaAtaque
from app.modules.clients.models import EmpresaCliente
from app.modules.commercial.models import Contratacion, TipoPlan
from app.modules.identity.models import Rol, Usuario
from app.modules.simulation.agent.base import CompanyGenerator
from app.modules.simulation.models import EmpresaSimulada
from app.modules.simulation.service import generate_simulated_company

_WITH_RESULTS = (
    selectinload(Auditoria.ejecuciones).selectinload(AuditoriaAtaque.ataque),
    selectinload(Auditoria.ejecuciones).selectinload(AuditoriaAtaque.resultado),
)


def create_for_contract(
    db: Session, contratacion: Contratacion, generator: CompanyGenerator, ataque_id: int | None
) -> Auditoria:
    """Contratación formalizada -> empresa simulada (RF-02) -> auditoría con sus ataques."""
    plan = contratacion.plan
    if plan.tipo == TipoPlan.INDIVIDUAL:
        ataques = [a for a in plan.ataques if a.id == ataque_id]
        if not ataques:
            raise BusinessRuleError("Indica cuál ataque del plan individual se contrató")
    else:
        ataques = list(plan.ataques)

    empresa = db.get(EmpresaCliente, contratacion.empresa_cliente_id)
    assert empresa is not None
    simulada = generate_simulated_company(db, empresa, generator)

    auditoria = Auditoria(
        contratacion_id=contratacion.id,
        empresa_simulada_id=simulada.id,
        ejecuciones=[AuditoriaAtaque(ataque=a) for a in ataques],
    )
    db.add(auditoria)
    db.commit()
    return auditoria


def _scoped_query(user: Usuario) -> Select[tuple[Auditoria]]:
    """Filtra por rol: es la única puerta de lectura de auditorías (RN-05)."""
    query = select(Auditoria).options(*_WITH_RESULTS).order_by(Auditoria.id.desc())
    if user.rol == Rol.CLIENTE:
        query = query.join(EmpresaSimulada).where(
            EmpresaSimulada.empresa_cliente_id == user.empresa_cliente_id
        )
    elif user.rol == Rol.ANALISTA:
        # TODO: restringir a auditorías asignadas cuando exista el flujo de asignación.
        pass
    return query


def list_audits(db: Session, user: Usuario) -> list[Auditoria]:
    """RF-11 (Cliente: solo las suyas) y RF-12 (Admin: todas)."""
    return list(db.scalars(_scoped_query(user)))


def get_audit(db: Session, user: Usuario, auditoria_id: int) -> Auditoria:
    auditoria = db.scalar(_scoped_query(user).where(Auditoria.id == auditoria_id))
    if auditoria is None:
        raise NotFoundError("Auditoría no encontrada")
    return auditoria


def assign_analyst(db: Session, auditoria: Auditoria, analista: Usuario) -> Auditoria:
    auditoria.analista_usuario_id = analista.id
    db.commit()
    return auditoria
