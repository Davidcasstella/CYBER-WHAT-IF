"""Ciclo completo del MVP (métrica de éxito #1 del documento de Aterrizaje)."""

from fastapi.testclient import TestClient

API = "/api/v1"


def _plan_id(client: TestClient, tipo: str) -> int:
    return next(p["id"] for p in client.get(f"{API}/planes").json() if p["tipo"] == tipo)


def test_flujo_paquete_completo(client: TestClient, admin, new_client, login) -> None:
    cliente = new_client("cliente@acme.co")

    # RF-03 + RF-10: contratar devuelve el enlace de WhatsApp.
    r = client.post(
        f"{API}/contrataciones", headers=cliente, json={"plan_id": _plan_id(client, "COMPLETO")}
    )
    assert r.status_code == 201, r.text
    assert r.json()["whatsapp_url"].startswith("https://wa.me/")
    contratacion_id = r.json()["contratacion"]["id"]

    # El Admin formaliza: se genera la empresa simulada y la auditoría con los 3 ataques.
    r = client.post(f"{API}/contrataciones/{contratacion_id}/formalizar", headers=admin)
    assert r.status_code == 200, r.text
    auditoria_id = r.json()["id"]
    assert len(r.json()["ejecuciones"]) == 3

    # Un Analista toma y ejecuta la auditoría (RF-04, RF-06).
    client.post(
        f"{API}/admin/usuarios",
        headers=admin,
        json={
            "nombre": "Ana Analista",
            "correo": "ana@cyberwhatif.co",
            "contrasena": "Analista123!",
            "rol": "ANALISTA",
        },
    )
    analista = login("ana@cyberwhatif.co", "Analista123!")
    client.post(f"{API}/auditorias/{auditoria_id}/tomar", headers=analista)
    r = client.post(f"{API}/auditorias/{auditoria_id}/ejecutar", headers=analista)
    assert r.status_code == 200, r.text
    assert r.json()["estado"] == "COMPLETADA"
    assert all(e["resultado"] is not None for e in r.json()["ejecuciones"])  # RN-02

    # RN-04: el Cliente no ve el informe hasta que el Analista lo valida.
    assert (
        client.get(f"{API}/auditorias/{auditoria_id}/informe", headers=cliente).status_code == 404
    )
    r = client.post(f"{API}/auditorias/{auditoria_id}/informe/validar", headers=analista)
    assert r.json()["estado"] == "VALIDADO"

    informe = client.get(f"{API}/auditorias/{auditoria_id}/informe", headers=cliente)
    assert informe.status_code == 200
    assert informe.json()["vulnerabilidades"]

    # RF-08: el paquete completo incluye dashboard.
    dashboard = client.get(f"{API}/auditorias/{auditoria_id}/dashboard", headers=cliente)
    assert dashboard.status_code == 200
    assert len(dashboard.json()["por_ataque"]) == 3


def test_plan_individual_no_incluye_dashboard(client: TestClient, admin, new_client, login) -> None:
    cliente = new_client("pyme@acme.co")
    plan = next(p for p in client.get(f"{API}/planes").json() if p["tipo"] == "INDIVIDUAL")
    ataque_id = plan["ataques"][0]["id"]

    r = client.post(
        f"{API}/contrataciones",
        headers=cliente,
        json={"plan_id": plan["id"], "ataque_id": ataque_id},
    )
    contratacion_id = r.json()["contratacion"]["id"]
    r = client.post(
        f"{API}/contrataciones/{contratacion_id}/formalizar?ataque_id={ataque_id}", headers=admin
    )
    auditoria_id = r.json()["id"]
    assert len(r.json()["ejecuciones"]) == 1

    client.post(f"{API}/auditorias/{auditoria_id}/ejecutar", headers=admin)
    r = client.get(f"{API}/auditorias/{auditoria_id}/dashboard", headers=cliente)
    assert r.status_code == 422  # RN-03


def test_cliente_no_ve_datos_de_otro_cliente(client: TestClient, new_client) -> None:
    """RN-05."""
    a = new_client("a@acme.co")
    b = new_client("b@otra.co")
    empresa_a = client.get(f"{API}/empresas/mia", headers=a).json()["id"]
    assert client.get(f"{API}/empresas/{empresa_a}", headers=b).status_code == 404
