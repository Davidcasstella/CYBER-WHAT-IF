from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, DbSession, require_roles
from app.modules.audit import service as audit_service
from app.modules.identity.models import Rol, Usuario
from app.modules.reports import service
from app.modules.reports.schemas import DashboardOut, InformeOut

router = APIRouter(prefix="/auditorias/{auditoria_id}", tags=["Informes y Dashboard"])


@router.get("/informe", response_model=InformeOut)
def get_report(db: DbSession, user: CurrentUser, auditoria_id: int) -> InformeOut:
    auditoria = audit_service.get_audit(db, user, auditoria_id)
    return service.get_report(db, user, auditoria)


@router.post("/informe/validar", response_model=InformeOut)
def validate_report(
    db: DbSession,
    auditoria_id: int,
    user: Usuario = Depends(require_roles(Rol.ANALISTA)),
) -> InformeOut:
    auditoria = audit_service.get_audit(db, user, auditoria_id)
    service.validate_report(db, user, auditoria)
    return service.get_report(db, user, auditoria)


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(db: DbSession, user: CurrentUser, auditoria_id: int) -> DashboardOut:
    auditoria = audit_service.get_audit(db, user, auditoria_id)
    return service.build_dashboard(db, user, auditoria)
