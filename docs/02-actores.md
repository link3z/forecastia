# Actores del Sistema

## Actor Principal: Usuario Autenticado

Propietario o gestor de un pequeño negocio. Tiene acceso completo a las funcionalidades de la plataforma una vez registrado e identificado.

**Responsabilidades:**
- Crear y configurar su negocio.
- Registrar cierres diarios.
- Importar históricos desde CSV.
- Consultar el dashboard y comparativas.
- Generar predicciones de caja.
- Exportar datos e informes.

## Actor Secundario: Sistema IA (OpenAI / Fallback Local)

Genera explicaciones en lenguaje natural de las predicciones. No interactúa directamente con el usuario.

- **OpenAI GPT-4o-mini**: se usa cuando `OPENAI_API_KEY` está configurado.
- **Fallback local**: plantilla basada en reglas, sin dependencias externas.

## Actor Secundario: Administrador del Sistema

Persona técnica que despliega y mantiene la infraestructura. Accede via Docker Compose y variables de entorno. No tiene rol diferenciado dentro de la aplicación.

## Actor Externo: Fuente de datos meteorológicos

En la versión actual, los datos meteorológicos los introduce el usuario manualmente en cada cierre diario. En versiones futuras podría integrarse una API de tiempo (Open-Meteo, AEMET, etc.).
