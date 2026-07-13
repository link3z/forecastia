# Plan de Testing

## Estrategia

ForecastIA aplica una pirámide de tests:
1. **Tests unitarios** (capa de dominio e infraestructura de IA) — sin mocks de DB, ejecución rápida.
2. **Tests de integración API** (Supertest con mocks de repositorios) — cubre el comportamiento HTTP.
3. **Tests E2E** (Playwright, fuera del alcance de la versión actual).

## Tests unitarios

Ubicación: `apps/api/src/tests/unit/`

| Fichero                                   | Qué testa                                         |
|-------------------------------------------|---------------------------------------------------|
| HeuristicForecastService.test.ts          | Predicción base, ajustes clima/evento, probabilidades |
| RecalibrationCalculator.test.ts           | Cálculo de métricas, mejor/peor día, media por DOW |
| LocalFallbackExplanationService.test.ts   | Generación de explicación sin API externa         |

Comando: `npm test` desde `apps/api`

## Tests de integración API

Ubicación: `apps/api/src/tests/api/`

| Fichero                    | Endpoints cubiertos                            |
|----------------------------|------------------------------------------------|
| auth.test.ts               | register, login, /me                           |
| businesses.test.ts         | crear, listar, obtener negocio                 |
| daily-records.test.ts      | crear cierre, validar duplicado/negativa, listar |
| forecasts.test.ts          | generar predicción, validar inputs, listar     |

Los tests usan `vi.hoisted()` + `vi.mock()` para reemplazar los repositorios Prisma con mocks en memoria. El módulo `bcrypt` también se mockea para evitar dependencia de la binario nativo.

## Cobertura objetivo

| Capa                  | Cobertura objetivo |
|-----------------------|--------------------|
| Servicios de dominio  | > 80%              |
| Casos de uso críticos | > 70%              |
| Endpoints API         | 100% happy path + principales errores |

## Ejecución

```bash
cd apps/api
npm test               # Ejecuta todos los tests una vez
npm run test:watch     # Modo watch (desarrollo)
```

## CI/CD

Los tests se ejecutan automáticamente en GitHub Actions en cada push y pull request (ver `.github/workflows/ci.yml`).
