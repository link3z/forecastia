# API REST

Base URL: `http://localhost:4000/api`

Todos los endpoints (excepto `/auth/register`, `/auth/login` y `/health`) requieren header:
```
Authorization: Bearer <token>
```

## Autenticación

| Método | Ruta             | Descripción                    |
|--------|------------------|--------------------------------|
| POST   | /auth/register   | Registrar usuario nuevo        |
| POST   | /auth/login      | Iniciar sesión, obtiene token  |
| GET    | /auth/me         | Obtener perfil del usuario     |

### POST /auth/register
```json
{ "name": "string", "email": "string", "password": "string (min 8 chars)" }
```
→ `201 { user: { id, name, email, createdAt } }`

### POST /auth/login
```json
{ "email": "string", "password": "string" }
```
→ `200 { token: "jwt", user: { id, name, email, createdAt } }`

## Negocios

| Método | Ruta                                          | Descripción                        |
|--------|-----------------------------------------------|------------------------------------|
| POST   | /businesses                                   | Crear negocio                      |
| GET    | /businesses                                   | Listar negocios del usuario        |
| GET    | /businesses/:id                               | Detalle de negocio                 |
| PUT    | /businesses/:id                               | Actualizar negocio                 |
| PUT    | /businesses/:id/predictive-variables          | Configurar variables predictivas   |

## Cierres diarios

| Método | Ruta                                              | Descripción             |
|--------|---------------------------------------------------|-------------------------|
| POST   | /businesses/:businessId/daily-records             | Crear cierre            |
| GET    | /businesses/:businessId/daily-records             | Listar cierres          |
| PUT    | /businesses/:businessId/daily-records/:recordId   | Editar cierre           |
| POST   | /businesses/:businessId/import-csv                | Importar CSV            |

## Dashboard

| Método | Ruta                                              | Descripción             |
|--------|---------------------------------------------------|-------------------------|
| GET    | /businesses/:businessId/dashboard/evolution       | Evolución de caja       |
| GET    | /businesses/:businessId/dashboard/metrics         | Métricas principales    |
| GET    | /businesses/:businessId/dashboard/comparisons     | Comparativas            |

## Predicciones

| Método | Ruta                                          | Descripción              |
|--------|-----------------------------------------------|--------------------------|
| POST   | /businesses/:businessId/forecasts             | Generar predicción       |
| GET    | /businesses/:businessId/forecasts             | Histórico de predicciones|

## Exportaciones

| Método | Ruta                                              | Descripción             |
|--------|---------------------------------------------------|-------------------------|
| GET    | /businesses/:businessId/export/csv?target=records | Exportar cierres CSV    |
| GET    | /businesses/:businessId/export/csv?target=metrics | Exportar métricas CSV   |
| GET    | /businesses/:businessId/export/json               | Exportar datos JSON     |
| GET    | /businesses/:businessId/export/report.md          | Exportar informe Markdown|

## Health

| Método | Ruta       | Descripción         |
|--------|------------|---------------------|
| GET    | /health    | Estado del servidor |

## Códigos de respuesta

| Código | Significado                                      |
|--------|--------------------------------------------------|
| 200    | OK                                               |
| 201    | Creado correctamente                             |
| 400    | Error de validación (Zod o DomainValidationError)|
| 401    | No autenticado (sin token o token inválido)      |
| 404    | Recurso no encontrado                            |
| 409    | Conflicto (email duplicado, fecha duplicada)     |
| 500    | Error interno del servidor                       |
