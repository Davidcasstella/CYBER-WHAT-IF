"""Datos iniciales: catálogo de ataques, planes y un Admin.

Uso: `uv run python -m app.seed`. Es idempotente: se puede ejecutar varias veces.
La contraseña del admin se lee de SEED_ADMIN_PASSWORD; nunca se deja fija en el código.
"""

import os
import sys
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models as _models  # noqa: F401  registra todos los modelos
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.modules.audit.models import AtaquePredefinido, NivelDificultad
from app.modules.commercial.models import PlanComercial, TipoPlan
from app.modules.identity.models import Rol, Usuario

ATAQUES = [
    (
        "Phishing",
        "PHISHING",
        "Correo fraudulento dirigido a empleados.",
        NivelDificultad.BAJO,
        "T1566",
    ),
    (
        "Ransomware",
        "RANSOMWARE",
        "Cifrado de activos críticos con extorsión.",
        NivelDificultad.ALTO,
        "T1486",
    ),
    (
        "Robo de credenciales",
        "ROBO_CREDENCIALES",
        "Obtención de credenciales válidas.",
        NivelDificultad.MEDIO,
        "T1110",
    ),
]


def seed(db: Session) -> None:
    ataques = {}
    for nombre, tipo, descripcion, dificultad, mitre in ATAQUES:
        ataque = db.scalar(select(AtaquePredefinido).where(AtaquePredefinido.nombre == nombre))
        if ataque is None:
            ataque = AtaquePredefinido(
                nombre=nombre,
                tipo=tipo,
                descripcion=descripcion,
                nivel_dificultad=dificultad,
                tecnica_mitre_principal=mitre,
            )
            db.add(ataque)
        ataques[tipo] = ataque

    if db.scalar(select(PlanComercial.id).limit(1)) is None:
        db.add_all(
            [
                PlanComercial(
                    nombre="Ataque individual",
                    tipo=TipoPlan.INDIVIDUAL,
                    precio=Decimal("1500000"),
                    descripcion="Un ataque a elección con informe sencillo.",
                    ataques=list(ataques.values()),
                ),
                PlanComercial(
                    nombre="Paquete completo",
                    tipo=TipoPlan.COMPLETO,
                    precio=Decimal("3900000"),
                    descripcion="Los tres ataques, informe completo y dashboard de métricas.",
                    ataques=list(ataques.values()),
                ),
            ]
        )

    admin_email = os.environ.get("SEED_ADMIN_EMAIL", "admin@cyberwhatif.co")
    if db.scalar(select(Usuario.id).where(Usuario.correo == admin_email)) is None:
        password = os.environ.get("SEED_ADMIN_PASSWORD")
        if not password:
            sys.exit("Define SEED_ADMIN_PASSWORD para crear el usuario administrador.")
        db.add(
            Usuario(
                nombre="Administrador",
                correo=admin_email,
                contrasena_hash=hash_password(password),
                rol=Rol.ADMIN,
            )
        )

    db.commit()


if __name__ == "__main__":
    with SessionLocal() as session:
        seed(session)
    print("Seed completado.")
