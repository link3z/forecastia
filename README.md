# ForecastIA

**Plataforma web inteligente para la predicción de ingresos en pequeños negocios.**

> Trabajo de Fin de Máster — Máster en Desarrollo con IA

---

## Descripción general

ForecastIA permite a propietarios y gestores de pequeños negocios (chiringuitos, cafeterías, food trucks, heladerías, terrazas) registrar su histórico de caja diaria, analizar tendencias y obtener predicciones de ingresos futuros con explicaciones en lenguaje natural generadas por IA.


## Entregables del TFM

| Recurso        | Enlace                                                                   |
|----------------|--------------------------------------------------------------------------|
| Aplicación     | https://forecastia-api.vercel.app                                        |
| Repositorio    | https://github.com/link3z/forecastia                                     |
| Vídeo          | https://youtu.be/jDo5lAfM4nM                                             |
| Presentación   | https://docs.google.com/presentation/d/1d4zmVL9KdVDihu5q-_EldKulLbgXkET6/edit?usp=sharing |

**Usuario de prueba:** `demo@forecastia.app` / `Demo1234!`

> **Copias de respaldo en el repositorio:** si alguno de los enlaces externos no funciona, el material está también en este repositorio:
> - **Vídeo**: [`forecastia-video.mp4`](forecastia-video.mp4) (raíz del proyecto).
> - **Presentación**: [`forecastia-slides.pptx`](forecastia-slides.pptx) (raíz del proyecto).

## Despliegue online

| Servicio  | URL                                                                      |
|-----------|--------------------------------------------------------------------------|
| Frontend  | https://forecastia-api.vercel.app                                        |
| API       | https://forecastiaapi-production.up.railway.app/api/health               |

- **Frontend**: desplegado en [Vercel](https://vercel.com) desde `apps/web`.
- **API + Base de datos**: desplegados en [Railway](https://railway.app) con PostgreSQL gestionado.

## Stack tecnológico

| Capa       | Tecnología                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS      |
| State/HTTP | TanStack Query                                |
| Gráficas   | Recharts                                      |
| Backend    | Node.js, Express, TypeScript                  |
| ORM        | Prisma + PostgreSQL                           |
| Validación | Zod                                           |
| Auth       | bcrypt + JWT                                  |
| IA         | OpenAI API (gpt-4o-mini) + fallback local     |
| Tests      | Vitest + Supertest                            |
| DevOps     | Docker, docker-compose, GitHub Actions        |

## Instalación y ejecución

### Con Docker (recomendado)

```bash
git clone <repo>
cd forecastia
cp apps/api/.env.example apps/api/.env
# Editar JWT_SECRET en apps/api/.env
docker-compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health

### Sin Docker

**Backend:**
```bash
cd apps/api
cp .env.example .env   # Editar DATABASE_URL y JWT_SECRET
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

**Frontend (otra terminal):**
```bash
cd apps/web
npm install
npm run dev
```

## Variables de entorno

Copiar `apps/api/.env.example` a `apps/api/.env` y completar:

| Variable        | Obligatorio | Descripción                          |
|-----------------|-------------|--------------------------------------|
| DATABASE_URL    | Sí          | URL de conexión a PostgreSQL         |
| JWT_SECRET      | Sí          | Secreto JWT (mínimo 32 caracteres)   |
| JWT_EXPIRES_IN  | No          | Expiración del token (default: `7d`) |
| OPENAI_API_KEY  | No          | API key de OpenAI (usa fallback si no)|
| CORS_ORIGIN     | No          | Origen CORS (default: `*`)           |
| PORT            | No          | Puerto API (default: `4000`)         |

## Usuario de prueba

```
Email:    demo@forecastia.app
Password: Demo1234!
```

El negocio de ejemplo es **Chiringuito O Solpor** con 50 cierres históricos (temporada 2024).

## Estructura del proyecto

```
forecastia/
├── apps/
│   ├── api/                   # Backend (Node.js/Express)
│   │   ├── prisma/            # Schema y seed
│   │   └── src/
│   │       ├── domain/        # Entidades, interfaces, servicios de dominio
│   │       ├── application/   # Casos de uso y DTOs
│   │       ├── infrastructure/# Repositorios Prisma, auth, AI, exporters
│   │       ├── presentation/  # Controllers, routes, middlewares HTTP
│   │       └── tests/         # Tests unitarios y de API
│   └── web/                   # Frontend (React/Vite)
│       └── src/
│           ├── features/      # Contextos por dominio
│           ├── pages/         # Pantallas (auth, negocios, dashboard…)
│           ├── components/ui/ # Componentes compartidos
│           └── services/      # Clientes HTTP
├── docs/                      # Documentación del TFM (12 ficheros)
└── docker-compose.yml
```

## Funcionalidades principales

- **Autenticación**: registro y login con JWT.
- **Gestión de negocios**: crear, configurar variables predictivas.
- **Cierres diarios**: registro manual, edición y importación desde CSV.
- **Dashboard**: evolución de caja (diaria/semanal/mensual), métricas principales, comparativas multivariable.
- **Predicción de caja**: modelo heurístico explicable con escenarios pesimista/medio/optimista y probabilidades.
- **Explicación IA**: texto en lenguaje natural vía OpenAI GPT-4o-mini o fallback local.
- **Exportaciones**: CSV (cierres y métricas), JSON completo, informe Markdown.

## Ejecutar tests

```bash
cd apps/api
npm test               # Todos los tests (39 tests en 7 suites)
npm run test:watch     # Modo watch
```

Suites: 3 unitarios (dominio + IA) + 4 de API (auth, negocios, cierres, predicciones).

## Docker

```bash
# Arrancar todo
docker-compose up --build

# Solo base de datos
docker-compose up db

# Parar y limpiar
docker-compose down -v
```

## Endpoints principales

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/businesses
GET    /api/businesses
GET    /api/businesses/:id

POST   /api/businesses/:id/daily-records
GET    /api/businesses/:id/daily-records
POST   /api/businesses/:id/import-csv

GET    /api/businesses/:id/dashboard/evolution
GET    /api/businesses/:id/dashboard/metrics
GET    /api/businesses/:id/dashboard/comparisons

POST   /api/businesses/:id/forecasts
GET    /api/businesses/:id/forecasts

GET    /api/businesses/:id/export/csv
GET    /api/businesses/:id/export/json
GET    /api/businesses/:id/export/report.md

GET    /api/health
```

## Decisiones técnicas destacadas

- **Arquitectura Limpia**: el dominio no depende de frameworks ni de la base de datos. Los casos de uso son testables en aislamiento.
- **ExplanationService con factory**: la aplicación funciona sin API key de OpenAI. La factory elige la implementación en tiempo de ejecución.
- **HeuristicForecastService aislado**: el modelo predictivo está encapsulado en una clase de dominio puro para poder sustituirlo por ML sin cambiar los casos de uso.
- **Vitest + vi.hoisted()**: los tests de API mockean Prisma y bcrypt a nivel de módulo para no necesitar base de datos real.

## Mejoras futuras

- Integración con API meteorológica (Open-Meteo) para obtener el tiempo automáticamente.
- Modelo ML real (Prophet, scikit-learn) en lugar del modelo heurístico.
- Predicciones de rango temporal (semana, mes).
- Notificaciones push cuando la previsión supera un umbral.
- Dashboard multi-negocio con comparativas entre locales.
- Roles (propietario / empleado / asesor).

## Documentación

Ver la carpeta `/docs` para documentación técnica completa (visión, actores, casos de uso, arquitectura, modelo de datos, API, tests, seguridad y despliegue).

---

*Desarrollado con ❤️ para el TFM del Máster en Desarrollo con IA.*
