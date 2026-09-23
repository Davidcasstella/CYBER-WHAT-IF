from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.core.logging import log_sensitive_access
from app.modules.clients.models import EmpresaCliente
from app.modules.clients.schemas import EmpresaClienteCreate
from app.modules.identity.models import Rol, Usuario


def register_company(db: Session, user: Usuario, data: EmpresaClienteCreate) -> EmpresaCliente:
    """RF-01. Si quien registra es un Cliente, la empresa queda vinculada a su usuario."""
    if user.rol == Rol.CLIENTE and user.empresa_cliente_id is not None:
        raise ConflictError("Tu usuario ya tiene una empresa registrada")
    if data.nit and db.scalar(select(EmpresaCliente.id).where(EmpresaCliente.nit == data.nit)):
        raise ConflictError("Ya existe una empresa con ese NIT")

    empresa = EmpresaCliente(**data.model_dump())
    db.add(empresa)
    db.flush()
    if user.rol == Rol.CLIENTE:
        user.empresa_cliente_id = empresa.id
    db.commit()
    return empresa


def get_company(db: Session, user: Usuario, empresa_id: int) -> EmpresaCliente:
    """RN-05: un Cliente solo ve su propia empresa; todo acceso queda registrado."""
    empresa = db.get(EmpresaCliente, empresa_id)
    if empresa is None:
        raise NotFoundError("Empresa no encontrada")
    if user.rol == Rol.CLIENTE and user.empresa_cliente_id != empresa.id:
        # Mismo mensaje que "no existe" para no revelar qué IDs existen.
        raise NotFoundError("Empresa no encontrada")
    log_sensitive_access(user.id, user.rol, "empresa_cliente", empresa.id)
    return empresa


def get_own_company(db: Session, user: Usuario) -> EmpresaCliente:
    if user.empresa_cliente_id is None:
        raise NotFoundError("Aún no has registrado tu empresa")
    return get_company(db, user, user.empresa_cliente_id)


def list_companies(db: Session, user: Usuario) -> list[EmpresaCliente]:
    if user.rol == Rol.CLIENTE:
        raise ForbiddenError("No tienes permiso para listar empresas")
    return list(db.scalars(select(EmpresaCliente).order_by(EmpresaCliente.razon_social)))
