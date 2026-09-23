from sqlalchemy.orm import Session

from app.modules.clients.models import EmpresaCliente
from app.modules.simulation.agent.base import CompanyGenerator, CompanyParams
from app.modules.simulation.models import ActivoSimulado, EmpresaSimulada


def generate_simulated_company(
    db: Session, empresa: EmpresaCliente, generator: CompanyGenerator
) -> EmpresaSimulada:
    """RF-02: pide al agente una réplica de la empresa y la persiste con sus activos."""
    generated = generator.generate(
        CompanyParams(
            razon_social=empresa.razon_social,
            sector=empresa.sector,
            cantidad_empleados=empresa.cantidad_empleados,
            dominio_principal=empresa.dominio_principal,
        )
    )
    simulada = EmpresaSimulada(
        empresa_cliente_id=empresa.id,
        nombre_generado=generated.nombre_generado,
        sector_simulado=generated.sector_simulado,
        plantilla_referencia=generated.plantilla_referencia,
        activos=[
            ActivoSimulado(
                tipo=a.tipo,
                nombre=a.nombre,
                criticidad=a.criticidad,
                ip_simulada=a.ip_simulada,
                sistema_operativo=a.sistema_operativo,
            )
            for a in generated.activos
        ],
    )
    db.add(simulada)
    db.flush()
    return simulada
