from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, require_roles
from app.modules.audit import service as audit_service
from app.modules.audit.schemas import AuditoriaOut
from app.modules.commercial import service
from app.modules.commercial.schemas import (
    ContratacionCreada,
    ContratacionCreate,
    ContratacionOut,
    PlanOut,
)
from app.modules.identity.models import Rol, Usuario
from app.modules.simulation.agent import get_company_generator
from app.modules.simulation.agent.base import CompanyGenerator

router = APIRouter(tags=["Comercial"])


@router.get("/planes", response_model=list[PlanOut])
def list_plans(db: DbSession) -> object:
    """Público: la landing muestra los planes sin iniciar sesión."""
    return service.list_active_plans(db)


@router.post(
    "/contrataciones", response_model=ContratacionCreada, status_code=status.HTTP_201_CREATED
)
def create_contract(
    db: DbSession,
    data: ContratacionCreate,
    user: Usuario = Depends(require_roles(Rol.CLIENTE)),
) -> ContratacionCreada:
    contratacion, url = service.create_contract(db, user, data)
    return ContratacionCreada(
        contratacion=ContratacionOut.model_validate(contratacion), whatsapp_url=url
    )


@router.post("/contrataciones/{contratacion_id}/formalizar", response_model=AuditoriaOut)
def formalize_contract(
    db: DbSession,
    contratacion_id: int,
    ataque_id: int | None = None,
    generator: CompanyGenerator = Depends(get_company_generator),
    _: Usuario = Depends(require_roles(Rol.ADMIN)),
) -> object:
    """El Admin confirma el pago recibido por WhatsApp; esto crea la auditoría (RF-02)."""
    contratacion = service.get_contract(db, contratacion_id)
    service.mark_as_formalized(db, contratacion)
    return audit_service.create_for_contract(db, contratacion, generator, ataque_id)
