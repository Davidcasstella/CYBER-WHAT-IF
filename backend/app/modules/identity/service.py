from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.core.security import hash_password, verify_password
from app.core.time import utcnow
from app.modules.identity.models import Rol, Usuario


def authenticate(db: Session, correo: str, contrasena: str) -> Usuario | None:
    user = db.scalar(select(Usuario).where(Usuario.correo == correo))
    # Verificar siempre evita revelar por tiempo de respuesta si el correo existe.
    valid = verify_password(contrasena, user.contrasena_hash if user else _DUMMY_HASH)
    if user is None or not valid or not user.activo:
        return None
    user.ultimo_acceso = utcnow()
    db.commit()
    return user


def create_user(
    db: Session, *, nombre: str, correo: str, contrasena: str, rol: Rol, telefono: str | None = None
) -> Usuario:
    if db.scalar(select(Usuario.id).where(Usuario.correo == correo)) is not None:
        raise ConflictError("Ya existe un usuario con ese correo")
    user = Usuario(
        nombre=nombre,
        correo=correo,
        contrasena_hash=hash_password(contrasena),
        rol=rol,
        telefono=telefono,
    )
    db.add(user)
    db.commit()
    return user


def list_users(db: Session) -> list[Usuario]:
    return list(db.scalars(select(Usuario).order_by(Usuario.id)))


_DUMMY_HASH = hash_password("dummy-password-for-timing")
