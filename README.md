# CyberWhat-If

Plataforma web que audita la ciberseguridad de una empresa **sin tocar su infraestructura real**. Un agente de IA genera una réplica simulada de la empresa y el motor de auditoría ejecuta 3 ataques sobre ella (phishing, ransomware y robo de credenciales). Después calcula el impacto técnico, operacional, financiero y de riesgo, y entrega un informe que un analista valida.

Documentos de referencia: Aterrizaje de la idea, SRS v1.0, Estado del arte y modelo de dominio v1.0, y Modelo ER v1.3.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Python 3.12+, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, JWT + Argon2 |
| Base de datos | MySQL 8 / MariaDB (modelo ER v1.3: 15 tablas + 2 triggers) |
| Frontend | React 19, Vite, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix), TanStack Query, React Router, react-hook-form + Zod |
| Calidad | pytest, ruff, mypy (strict) · oxlint, `tsc -b` |

## Estructura

```
backend/
  app/
    core/            config, BD, seguridad (JWT/Argon2), errores, logging, fechas UTC
    api/             dependencias (usuario actual, control por rol) y router v1
    modules/         un paquete por módulo del modelo de dominio:
      identity/      Usuario, login, registro                       (RNF-02)
      clients/       Empresa_Cliente                                (RF-01, RF-11)
      simulation/    Empresa_Simulada, Activo_Simulado              (RF-02)
        agent/       puerto CompanyGenerator + implementación fake (luego: LLM)
        sandbox.py   garantía de aislamiento: solo red 198.51.100.0/24 (RN-01)
      audit/         Ataque, Auditoria, Resultado_Impacto, Vulnerabilidad (RF-04..06)
        attacks/     un archivo por ataque, patrón Strategy + registro (RNF-05)
        impact.py    cálculo de las 4 dimensiones
        engine.py    orquestador de la auditoría
      reports/       Informe, Recomendacion_Mitigacion, dashboard   (RF-07..09)
      commercial/    Plan, Contratacion, Solicitud WhatsApp         (RF-03, RF-10)
      admin/         gestión de usuarios                            (RF-12)
    seed.py          catálogo de ataques, planes y admin inicial
  migrations/        Alembic (0001 = ER v1.3 completo)
  tests/             flujo completo del MVP + reglas de negocio

frontend/src/
  app/               providers, router (rutas lazy), 404
  components/        layout, piezas compartidas; ui/ = componentes shadcn
  features/          un directorio por módulo, espejo del backend:
    auth/ companies/ commercial/ audits/ reports/ admin/
  lib/               cliente HTTP, tema, formatos (COP, fechas)
  types/api.ts       tipos que reflejan los esquemas del backend
```

Cada módulo del backend sigue la misma forma: `models.py` (ORM) → `schemas.py` (entrada/salida) → `service.py` (reglas de negocio) → `router.py` (HTTP delgado). Las reglas RN-01 a RN-05 viven en los servicios, no en los routers.

## Puesta en marcha

Requisitos: [uv](https://docs.astral.sh/uv/), Node 20+ y Docker (para MySQL).

```bash
# 1. Base de datos
docker compose up -d db

# 2. Backend  (http://localhost:8000/docs)
cd backend
cp .env.example .env              # y cambia JWT_SECRET
uv sync
uv run alembic upgrade head
SEED_ADMIN_PASSWORD='una-clave-segura' uv run python -m app.seed
uv run fastapi dev app/main.py

# 3. Frontend  (http://localhost:5173)
cd frontend
npm install
npm run dev
```

El admin inicial es `admin@cyberwhatif.co` (se puede cambiar con `SEED_ADMIN_EMAIL`).

## Flujo del MVP

1. El **Cliente** se registra, registra su empresa y contrata un plan. La app lo redirige a WhatsApp.
2. El **Admin** confirma el pago con `POST /contrataciones/{id}/formalizar`. En ese momento se genera la empresa simulada y la auditoría.
3. El **Analista** ejecuta la auditoría y valida el informe.
4. El **Cliente** ve el informe. Si contrató el paquete completo, también ve el dashboard.

## Comandos de calidad

```bash
cd backend  && uv run pytest && uv run ruff check . && uv run mypy app
cd frontend && npm run lint && npm run build
```

## Cómo agregar un ataque nuevo (RNF-05)

1. Crea `backend/app/modules/audit/attacks/mi_ataque.py` con una subclase de `AttackScenario` decorada con `@register` y `key = "MI_ATAQUE"`.
2. Impórtalo en `attacks/__init__.py`.
3. Inserta su fila en `ataque_predefinido` con `tipo = 'MI_ATAQUE'` (en `seed.py` o con una migración).

No hace falta tocar el generador de empresas ni el motor.

## Pendientes conocidos

- **Generador LLM**: `COMPANY_GENERATOR=llm` aún no está implementado; hoy se usa el generador determinista.
- **Fórmulas de impacto** (`impact.py`) y **heurísticas de ataques**: son provisionales y hay que calibrarlas y documentar sus supuestos (MITRE ATT&CK).
- **Ataque elegido en el plan individual**: el ER v1.3 no tiene una columna para guardarlo. Hoy viaja en el mensaje de WhatsApp y el Admin lo indica al formalizar. Conviene agregar `contratacion.ataque_id` en una migración.
- **Registro de accesos (RN-05)**: hoy se escribe en el logger `cyberwhatif.access`. Si el docente pide trazabilidad persistente, hará falta una tabla de auditoría de accesos.
- **Sesión**: el JWT se guarda en `sessionStorage`. Para producción conviene migrar a una cookie httpOnly.
- **Ejecución síncrona**: si una auditoría supera los 5 minutos (RNF-01), hay que moverla a una cola de tareas.
