from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.core.time import UtcDatetime
from app.modules.commercial.models import EstadoPago, TipoPlan


class AtaqueResumen(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    tipo: str | None
    tecnica_mitre_principal: str | None


class PlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    tipo: TipoPlan
    precio: Decimal
    duracion_dias: int | None
    descripcion: str | None
    ataques: list[AtaqueResumen]


class ContratacionCreate(BaseModel):
    plan_id: int
    #: Para planes INDIVIDUAL: cuál de los ataques del plan se contrata.
    ataque_id: int | None = None
    codigo_cupon: str | None = Field(default=None, max_length=30)


class ContratacionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    empresa_cliente_id: int
    plan_id: int
    estado_pago: EstadoPago
    fecha: UtcDatetime


class ContratacionCreada(BaseModel):
    contratacion: ContratacionOut
    #: RF-10: el frontend redirige aquí para formalizar pago y entrega.
    whatsapp_url: str
