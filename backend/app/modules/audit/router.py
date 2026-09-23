from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, DbSession, require_roles
from app.modules.audit import engine, service
from app.modules.audit.attacks import registered_keys
from app.modules.audit.schemas import AuditoriaOut
from app.modules.identity.models import Rol, Usuario

router = APIRouter(prefix="/auditorias", tags=["Motor de Auditoría"])


@router.get("", response_model=list[AuditoriaOut])
def list_audits(db: DbSession, user: CurrentUser) -> object:
    return service.list_audits(db, user)


@router.get("/ataques-disponibles", response_model=list[str])
def available_attacks(_: CurrentUser) -> list[str]:
    """Claves de los ataques implementados en el motor (útil para verificar RNF-05)."""
    return registered_keys()


@router.get("/{auditoria_id}", response_model=AuditoriaOut)
def get_audit(db: DbSession, user: CurrentUser, auditoria_id: int) -> object:
    return service.get_audit(db, user, auditoria_id)


@router.post("/{auditoria_id}/tomar", response_model=AuditoriaOut)
def take_audit(
    db: DbSession,
    auditoria_id: int,
    user: Usuario = Depends(require_roles(Rol.ANALISTA)),
) -> object:
    """El Analista se asigna la auditoría para supervisarla."""
    return service.assign_analyst(db, service.get_audit(db, user, auditoria_id), user)


@router.post("/{auditoria_id}/ejecutar", response_model=AuditoriaOut)
def run_audit(
    db: DbSession,
    auditoria_id: int,
    user: Usuario = Depends(require_roles(Rol.ANALISTA, Rol.ADMIN)),
) -> object:
    """RF-04: ejecuta los ataques contratados sobre la empresa simulada."""
    return engine.run_audit(db, service.get_audit(db, user, auditoria_id))
