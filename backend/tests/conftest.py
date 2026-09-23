import os

# Debe definirse antes de importar la app (la configuración se lee al importar).
os.environ.setdefault("JWT_SECRET", "secreto-solo-para-tests-1234567890")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ["SEED_ADMIN_PASSWORD"] = "AdminPass123!"

from collections.abc import Callable, Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models as _models  # noqa: F401  registra todos los modelos
from app.core.database import Base, get_db
from app.main import app
from app.seed import seed

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture
def db() -> Iterator[Session]:
    Base.metadata.create_all(engine)
    session = TestingSession()
    seed(session)
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


AuthHeaders = dict[str, str]


@pytest.fixture
def login(client: TestClient) -> Callable[[str, str], AuthHeaders]:
    def _login(correo: str, contrasena: str) -> AuthHeaders:
        r = client.post("/api/v1/auth/login", data={"username": correo, "password": contrasena})
        assert r.status_code == 200, r.text
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    return _login


@pytest.fixture
def admin(login: Callable[[str, str], AuthHeaders]) -> AuthHeaders:
    return login("admin@cyberwhatif.co", "AdminPass123!")


@pytest.fixture
def new_client(
    client: TestClient, login: Callable[[str, str], AuthHeaders]
) -> Callable[[str], AuthHeaders]:
    """Registra un Cliente con su empresa y devuelve sus cabeceras de autenticación."""

    def _create(correo: str) -> AuthHeaders:
        r = client.post(
            "/api/v1/auth/registro",
            json={"nombre": "Cliente Prueba", "correo": correo, "contrasena": "ClientePass1!"},
        )
        assert r.status_code == 201, r.text
        headers = login(correo, "ClientePass1!")
        r = client.post(
            "/api/v1/empresas",
            headers=headers,
            json={
                "razon_social": f"Empresa {correo}",
                "cantidad_empleados": 50,
                "dominio_principal": "acme.co",
            },
        )
        assert r.status_code == 201, r.text
        return headers

    return _create
