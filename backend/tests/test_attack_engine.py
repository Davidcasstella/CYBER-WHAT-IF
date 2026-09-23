import pytest

from app.core.exceptions import BusinessRuleError
from app.modules.audit.attacks import registered_keys
from app.modules.simulation.models import ActivoSimulado, Criticidad, EmpresaSimulada
from app.modules.simulation.sandbox import assert_isolated


def test_los_tres_ataques_del_mvp_estan_registrados() -> None:
    assert registered_keys() == ["PHISHING", "RANSOMWARE", "ROBO_CREDENCIALES"]


def test_sandbox_rechaza_activos_fuera_de_la_red_simulada() -> None:
    """RN-01: una IP real (aquí, un DNS público) aborta la auditoría."""
    empresa = EmpresaSimulada(
        nombre_generado="X",
        activos=[
            ActivoSimulado(
                tipo="SERVIDOR", nombre="real", ip_simulada="8.8.8.8", criticidad=Criticidad.ALTA
            )
        ],
    )
    with pytest.raises(BusinessRuleError, match="RN-01"):
        assert_isolated(empresa)


def test_sandbox_acepta_la_red_simulada() -> None:
    empresa = EmpresaSimulada(
        nombre_generado="X",
        activos=[
            ActivoSimulado(
                tipo="SERVIDOR",
                nombre="sim",
                ip_simulada="198.51.100.7",
                criticidad=Criticidad.ALTA,
            )
        ],
    )
    assert_isolated(empresa)
