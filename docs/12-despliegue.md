# Despliegue

## Local con Docker Compose (recomendado)

```bash
# 1. Copiar variables de entorno
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env con tus valores (JWT_SECRET obligatorio)

# 2. Construir y arrancar
docker-compose up --build

# 3. Acceder
# Frontend: http://localhost:5173
# API:      http://localhost:4000/api/health
```

El `docker-compose.yml` levanta 3 servicios:
- `db`: PostgreSQL 16
- `api`: Backend Node.js (migrations + seed automáticos)
- `web`: Frontend Vite (modo desarrollo con HMR)

## Local sin Docker

```bash
# Requisitos: Node.js 20+, PostgreSQL local

# Backend
cd apps/api
cp .env.example .env   # editar DATABASE_URL y JWT_SECRET
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev

# Frontend (otra terminal)
cd apps/web
npm install
npm run dev
```

## Variables de entorno necesarias

| Variable        | Descripción                              | Ejemplo                    |
|-----------------|------------------------------------------|----------------------------|
| DATABASE_URL    | Conexión a PostgreSQL                    | postgresql://user:pw@db/fc |
| JWT_SECRET      | Secreto para firmar tokens JWT           | cambiar-en-produccion-32ch |
| JWT_EXPIRES_IN  | Tiempo de expiración del token           | 7d                         |
| OPENAI_API_KEY  | API key de OpenAI (opcional)             | sk-...                     |
| CORS_ORIGIN     | Origen permitido para CORS               | http://localhost:5173       |
| PORT            | Puerto del servidor API                  | 4000                       |

## Usuario de prueba (seed)

```
Email:    demo@forecastia.app
Password: Demo1234!
```

## Despliegue en producción (ejemplo Railway/Render)

1. Crear base de datos PostgreSQL en el proveedor.
2. Configurar variables de entorno en el dashboard.
3. Build del backend: `npm run build` → `node dist/server.js`.
4. Build del frontend: `npm run build` → servir `dist/` con nginx o similar.
5. Ejecutar migrations en el primer despliegue: `npx prisma migrate deploy`.
