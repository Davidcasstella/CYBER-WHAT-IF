import logging

from app.core.config import get_settings

# Logger dedicado a accesos a datos sensibles (RN-05). Separarlo permite enviarlo
# a un destino propio (archivo, SIEM) sin mezclarlo con el log de la aplicación.
access_logger = logging.getLogger("cyberwhatif.access")


def configure_logging() -> None:
    level = logging.DEBUG if get_settings().app_debug else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )


def log_sensitive_access(user_id: int, role: str, resource: str, resource_id: int) -> None:
    """Registra quién accedió a qué dato sensible de una empresa cliente."""
    access_logger.info(
        "user_id=%s role=%s resource=%s resource_id=%s", user_id, role, resource, resource_id
    )
