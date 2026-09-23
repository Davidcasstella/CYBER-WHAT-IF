from app.modules.audit.attacks.base import AttackScenario

_REGISTRY: dict[str, AttackScenario] = {}


def register[T: type[AttackScenario]](cls: T) -> T:
    """Decorador: `@register` sobre una subclase la hace disponible para el motor."""
    if cls.key in _REGISTRY:
        raise ValueError(f"Ataque duplicado en el registro: {cls.key}")
    _REGISTRY[cls.key] = cls()
    return cls


def get_scenario(key: str) -> AttackScenario:
    try:
        return _REGISTRY[key]
    except KeyError as exc:
        raise LookupError(f"No hay implementación registrada para el ataque '{key}'") from exc


def registered_keys() -> list[str]:
    return sorted(_REGISTRY)
