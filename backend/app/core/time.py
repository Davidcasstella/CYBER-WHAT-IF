"""Convención de fechas: la BD guarda DATETIME sin zona, siempre en UTC.

- Para escribir: `utcnow()` (nunca `datetime.now()`, que usa la hora local del servidor).
- Para responder: los esquemas usan `UtcDatetime`, que serializa con sufijo +00:00 para
  que el navegador convierta a la hora local del usuario.
- CURRENT_TIMESTAMP de MySQL también debe ser UTC: el contenedor usa UTC por defecto.
"""

from datetime import UTC, datetime
from typing import Annotated

from pydantic import AfterValidator


def utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _assume_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


UtcDatetime = Annotated[datetime, AfterValidator(_assume_utc)]
