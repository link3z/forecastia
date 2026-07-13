# Arquitectura del Sistema

## Estilo arquitectónico

ForecastIA aplica **Arquitectura Limpia (Clean Architecture)** en el backend, con las capas:

```
Domain → Application → Infrastructure → Presentation
```

Las dependencias apuntan siempre hacia el interior: la capa de dominio no conoce nada de Express, Prisma u OpenAI.

## Estructura de carpetas

```
forecastia/
├── apps/
│   ├── api/                     # Backend Node.js/Express
│   │   └── src/
│   │       ├── domain/          # Entidades, repositorios (interfaces), servicios de dominio
│   │       ├── application/     # Casos de uso, DTOs
│   │       ├── infrastructure/  # Prisma, repositorios concretos, auth, AI, exporters
│   │       └── presentation/    # HTTP controllers, routes, middlewares
│   └── web/                     # Frontend React/Vite
│       └── src/
│           ├── features/        # Contextos y hooks por dominio
│           ├── pages/           # Pantallas de la aplicación
│           ├── components/ui/   # Componentes compartidos
│           └── services/        # Clientes de API
├── packages/shared/             # Tipos compartidos (opcional)
├── docs/                        # Documentación del TFM
└── docker-compose.yml
```

## Capas del backend

### Domain
- **Entities**: User, Business, DailyRecord, BusinessMetrics, Forecast, PredictiveVariableConfig.
- **Repository interfaces**: contratos que la infraestructura implementa.
- **Domain services**: HeuristicForecastService (modelo predictivo), RecalibrationCalculator (métricas), ExplanationService (interfaz de IA).

### Application
- **Use cases**: un caso de uso por operación (CreateBusinessUseCase, GenerateForecastUseCase, RecalibrateBusinessMetricsUseCase…).
- **DTOs**: esquemas Zod para validación de entradas.

### Infrastructure
- **Prisma ORM**: acceso a PostgreSQL.
- **Repositorios Prisma**: implementaciones concretas de los interfaces de dominio.
- **Auth**: bcrypt (password hasher), JWT (token service).
- **AI**: OpenAIExplanationService, LocalFallbackExplanationService, ExplanationServiceFactory.
- **Exporters**: CsvExporter, JsonExporter, MarkdownReportExporter.

### Presentation
- **Controllers**: lógica HTTP (parseo de request, instanciación de use cases, serialización de response).
- **Routes**: agrupación de endpoints con mergeParams.
- **Middlewares**: authMiddleware, asyncHandler, errorHandler.

## Stack tecnológico

| Capa         | Tecnología                             |
|--------------|----------------------------------------|
| Frontend     | React 18, Vite, TypeScript, Tailwind   |
| Estado HTTP  | TanStack Query                         |
| Gráficas     | Recharts                               |
| Backend      | Node.js, Express, TypeScript           |
| ORM          | Prisma + PostgreSQL                    |
| Validación   | Zod                                    |
| Auth         | bcrypt + JWT                           |
| IA           | OpenAI API (gpt-4o-mini) + fallback    |
| Tests        | Vitest, Supertest                      |
| DevOps       | Docker, docker-compose, GitHub Actions |
