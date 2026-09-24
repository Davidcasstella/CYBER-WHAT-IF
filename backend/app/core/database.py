from collections.abc import Iterator
from typing import Any

import certifi
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import Settings, get_settings


class Base(DeclarativeBase):
    """Base declarativa común a todos los modelos ORM."""


def connect_args(settings: Settings) -> dict[str, Any]:
    """Argumentos del driver. Con DATABASE_SSL, PyMySQL cifra la conexión y valida el
    certificado y el nombre del servidor contra las CA públicas de certifi."""
    if settings.database_ssl and settings.database_url.startswith("mysql"):
        return {"ssl": {"ca": certifi.where(), "check_hostname": True}}
    return {}


_settings = get_settings()
engine = create_engine(
    _settings.database_url,
    pool_pre_ping=True,
    pool_recycle=1800,  # renueva conexiones antes de que el servidor las cierre por inactividad
    connect_args=connect_args(_settings),
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """Una sesión por request; se cierra siempre al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
