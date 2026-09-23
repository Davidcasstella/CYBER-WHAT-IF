from urllib.parse import quote

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import BusinessRuleError, NotFoundError
from app.modules.commercial.models import (
    Contratacion,
    EstadoPago,
    PlanComercial,
    SolicitudContactoWhatsApp,
    TipoPlan,
)
from app.modules.commercial.schemas import ContratacionCreate
from app.modules.identity.models import Usuario


def list_active_plans(db: Session) -> list[PlanComercial]:
    return list(
        db.scalars(select(PlanComercial).where(PlanComercial.activo).order_by(PlanComercial.precio))
    )


def create_contract(
    db: Session, user: Usuario, data: ContratacionCreate
) -> tuple[Contratacion, str]:
    """RF-03 + RF-10: registra la contratación y devuelve el enlace de WhatsApp."""
    if user.empresa_cliente_id is None:
        raise BusinessRuleError("Registra tu empresa antes de contratar un plan")

    plan = db.get(PlanComercial, data.plan_id)
    if plan is None or not plan.activo:
        raise NotFoundError("Plan no encontrado")
    if plan.tipo == TipoPlan.INDIVIDUAL and data.ataque_id not in {a.id for a in plan.ataques}:
        raise BusinessRuleError("Elige cuál de los ataques del plan quieres contratar")

    contratacion = Contratacion(
        empresa_cliente_id=user.empresa_cliente_id,
        usuario_id=user.id,
        plan_id=plan.id,
        codigo_cupon=data.codigo_cupon,
    )
    db.add(contratacion)
    db.flush()

    numero = get_settings().whatsapp_number
    db.add(SolicitudContactoWhatsApp(contratacion_id=contratacion.id, numero_whatsapp=numero))
    db.commit()

    mensaje = (
        f"Hola, quiero formalizar la contratación #{contratacion.id} del plan '{plan.nombre}'."
    )
    if data.ataque_id is not None:
        mensaje += f" Ataque elegido: #{data.ataque_id}."
    return contratacion, f"https://wa.me/{numero}?text={quote(mensaje)}"


def get_contract(db: Session, contratacion_id: int) -> Contratacion:
    contratacion = db.get(Contratacion, contratacion_id)
    if contratacion is None:
        raise NotFoundError("Contratación no encontrada")
    return contratacion


def mark_as_formalized(db: Session, contratacion: Contratacion) -> None:
    if contratacion.estado_pago != EstadoPago.PENDIENTE:
        raise BusinessRuleError("Solo se puede formalizar una contratación pendiente")
    contratacion.estado_pago = EstadoPago.FORMALIZADO
