from fastapi import APIRouter

from app.modules.admin.router import router as admin_router
from app.modules.audit.router import router as audit_router
from app.modules.clients.router import router as clients_router
from app.modules.commercial.router import router as commercial_router
from app.modules.identity.router import router as identity_router
from app.modules.reports.router import router as reports_router
from app.modules.reports.router import summary_router

api_router = APIRouter()
api_router.include_router(identity_router)
api_router.include_router(clients_router)
api_router.include_router(commercial_router)
api_router.include_router(audit_router)
api_router.include_router(reports_router)
api_router.include_router(summary_router)
api_router.include_router(admin_router)
