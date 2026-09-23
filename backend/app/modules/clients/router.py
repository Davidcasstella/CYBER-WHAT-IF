from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.modules.clients import service
from app.modules.clients.schemas import EmpresaClienteCreate, EmpresaClienteOut

router = APIRouter(prefix="/empresas", tags=["Clientes"])


@router.post("", response_model=EmpresaClienteOut, status_code=status.HTTP_201_CREATED)
def register_company(db: DbSession, user: CurrentUser, data: EmpresaClienteCreate) -> object:
    return service.register_company(db, user, data)


@router.get("", response_model=list[EmpresaClienteOut])
def list_companies(db: DbSession, user: CurrentUser) -> object:
    return service.list_companies(db, user)


@router.get("/mia", response_model=EmpresaClienteOut)
def get_own_company(db: DbSession, user: CurrentUser) -> object:
    return service.get_own_company(db, user)


@router.get("/{empresa_id}", response_model=EmpresaClienteOut)
def get_company(db: DbSession, user: CurrentUser, empresa_id: int) -> object:
    return service.get_company(db, user, empresa_id)
