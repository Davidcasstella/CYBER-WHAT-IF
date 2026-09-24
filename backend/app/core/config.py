from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración leída de variables de entorno (o del archivo .env)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "CyberWhat-If API"
    app_env: Literal["development", "test", "production"] = "development"
    app_debug: bool = False
    api_prefix: str = "/api/v1"
    #: Swagger en /docs. Sin definir: activo salvo en producción. DOCS_ENABLED=true lo fuerza.
    docs_enabled: bool | None = None

    database_url: str = "mysql+pymysql://cyberwhatif:cyberwhatif@localhost:3306/cyberwhatif"
    #: Exige TLS verificando el certificado del servidor (Azure Database for MySQL lo requiere).
    database_ssl: bool = False

    jwt_secret: str = Field(min_length=16)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # En .env se escribe separado por comas: CORS_ORIGINS=http://a,http://b
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    whatsapp_number: str = "573000000000"
    company_generator: Literal["fake", "llm"] = "fake"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
