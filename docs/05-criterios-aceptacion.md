# Criterios de Aceptación

## CU-001 Crear negocio

- El formulario requiere: nombre, tipo, ubicación, moneda, fecha de inicio.
- Si `isSeasonal` es `true`, los campos `seasonStart` y `seasonEnd` son opcionales.
- El negocio se asocia al usuario autenticado.
- Al crear un negocio, se genera automáticamente una configuración de variables predictivas con valores por defecto.
- Respuesta: `201 Created` con el negocio creado.

## CU-003 Registrar cierre diario

- La caja no puede ser negativa (400 si es negativa).
- No puede haber dos cierres para el mismo negocio y fecha (409 si ya existe).
- Si se informan `revenue` y `tickets`, el `averageTicket` se calcula automáticamente.
- Tras crear un cierre, se recalibran las métricas del negocio.
- Respuesta: `201 Created` con el cierre creado.

## CU-004 Importar CSV

- El fichero debe tener cabecera: `fecha,caja,tickets,ticketMedio,clima,tempMax,tempMin,lluvia,viento,eventos,campania,seguidores,observaciones`.
- El sistema informa de filas correctas, ignoradas y con error.
- Si `overwrite: true`, los cierres existentes se sobrescriben; si no, se ignoran.
- Tras importar, se recalibran las métricas.

## CU-009 Generar predicción

- `targetDate` es obligatorio (400 si falta).
- El sistema devuelve: `expectedRevenue`, `minRevenue`, `maxRevenue`, escenarios y `probabilities`.
- Los factores influyentes se listan con su efecto y descripción.
- La predicción se persiste en base de datos.
- Respuesta: `201 Created`.

## CU-012 Explicar predicción con IA

- Si `OPENAI_API_KEY` está configurado, se llama a GPT-4o-mini.
- Si la llamada a OpenAI falla o no hay API key, se usa el fallback local.
- La explicación no bloquea la creación de la predicción (se guarda `null` si falla).
- La explicación está en español.

## CU-015 Iniciar sesión

- El registro rechaza emails duplicados (409).
- El login rechaza credenciales incorrectas (401).
- El token JWT tiene expiración configurable via `JWT_EXPIRES_IN`.
- Las rutas protegidas devuelven 401 sin token y 401 con token inválido.
