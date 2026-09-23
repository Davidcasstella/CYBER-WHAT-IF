from app.core.config import get_settings
from app.modules.simulation.agent.base import CompanyGenerator
from app.modules.simulation.agent.fake import FakeCompanyGenerator


def get_company_generator() -> CompanyGenerator:
    """Elige la implementación según COMPANY_GENERATOR. Se inyecta con Depends()."""
    match get_settings().company_generator:
        case "fake":
            return FakeCompanyGenerator()
        case "llm":
            # TODO(RF-02): implementar LLMCompanyGenerator en agent/llm.py
            raise NotImplementedError("El generador basado en LLM aún no está implementado")
