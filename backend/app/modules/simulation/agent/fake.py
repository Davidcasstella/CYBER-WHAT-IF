from app.modules.simulation.agent.base import (
    CompanyParams,
    GeneratedAsset,
    GeneratedCompany,
)
from app.modules.simulation.models import Criticidad
from app.modules.simulation.sandbox import SIMULATED_NETWORK


class FakeCompanyGenerator:
    """Generador determinista para desarrollo y tests: sin LLM, sin costo, sin red.

    Escala el número de estaciones de trabajo con la cantidad de empleados para que
    empresas distintas produzcan réplicas distintas.
    """

    def generate(self, params: CompanyParams) -> GeneratedCompany:
        hosts = SIMULATED_NETWORK.hosts()
        employees = params.cantidad_empleados or 10
        workstations = max(1, min(employees // 10, 20))
        domain = params.dominio_principal or "empresa.test"

        activos = [
            GeneratedAsset(
                "SERVIDOR",
                "Controlador de dominio",
                Criticidad.CRITICA,
                str(next(hosts)),
                "Windows Server 2019",
            ),
            GeneratedAsset(
                "SERVIDOR",
                "Servidor de archivos",
                Criticidad.ALTA,
                str(next(hosts)),
                "Windows Server 2016",
            ),
            GeneratedAsset("SERVICIO", f"Correo corporativo @{domain}", Criticidad.ALTA),
            GeneratedAsset(
                "BASE_DATOS",
                "Base de datos de clientes",
                Criticidad.CRITICA,
                str(next(hosts)),
                "Ubuntu 22.04",
            ),
        ]
        activos += [
            GeneratedAsset(
                "ENDPOINT",
                f"Estación de trabajo {i + 1}",
                Criticidad.MEDIA,
                str(next(hosts)),
                "Windows 11",
            )
            for i in range(workstations)
        ]

        return GeneratedCompany(
            nombre_generado=f"{params.razon_social} (simulada)",
            sector_simulado=params.sector,
            plantilla_referencia="fake-v1",
            activos=activos,
        )
