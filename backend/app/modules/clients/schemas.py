from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.time import UtcDatetime


class EmpresaClienteCreate(BaseModel):
    """RF-01: datos de la empresa a auditar."""

    razon_social: str = Field(min_length=2, max_length=200)
    nit: str | None = Field(default=None, max_length=30)
    sector: str | None = Field(default=None, max_length=100)
    cantidad_empleados: int | None = Field(default=None, ge=1, le=1_000_000)
    dominio_principal: str | None = Field(
        default=None, max_length=150, pattern=r"^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$"
    )
    correo_contacto: EmailStr | None = None
    pais: str | None = Field(default=None, max_length=80)
    ciudad: str | None = Field(default=None, max_length=80)


class EmpresaClienteOut(EmpresaClienteCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fecha_registro: UtcDatetime
