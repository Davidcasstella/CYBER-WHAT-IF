from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}


def test_registro_crea_siempre_un_cliente(client: TestClient, login) -> None:
    r = client.post(
        "/api/v1/auth/registro",
        json={"nombre": "Ana", "correo": "ana@acme.co", "contrasena": "Segura123!", "rol": "ADMIN"},
    )
    assert r.status_code == 201
    assert r.json()["rol"] == "CLIENTE"  # el campo rol enviado se ignora

    me = client.get("/api/v1/auth/me", headers=login("ana@acme.co", "Segura123!"))
    assert me.json()["correo"] == "ana@acme.co"


def test_login_con_contrasena_incorrecta(client: TestClient) -> None:
    r = client.post(
        "/api/v1/auth/login", data={"username": "admin@cyberwhatif.co", "password": "mala"}
    )
    assert r.status_code == 401


def test_sin_token_no_hay_acceso(client: TestClient) -> None:
    assert client.get("/api/v1/auditorias").status_code == 401


def test_cliente_no_accede_a_administracion(client: TestClient, new_client) -> None:
    assert client.get("/api/v1/admin/usuarios", headers=new_client("c@acme.co")).status_code == 403


def test_fechas_se_serializan_en_utc(client: TestClient, new_client) -> None:
    """Sin zona horaria, el navegador interpretaría la fecha UTC como hora local."""
    empresa = client.get("/api/v1/empresas/mia", headers=new_client("utc@acme.co")).json()
    assert empresa["fecha_registro"].endswith(("Z", "+00:00"))
