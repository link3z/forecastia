# Seguridad

## Autenticación y autorización

- **JWT**: tokens firmados con `JWT_SECRET` (mínimo 32 caracteres en producción). Expiración configurable via `JWT_EXPIRES_IN`.
- **Rutas protegidas**: `authMiddleware` verifica el token en cada request. Sin token → 401.
- **Aislamiento por usuario**: todos los casos de uso verifican que el negocio pertenece al `userId` del token.

## Contraseñas

- Almacenadas como hash **bcrypt** con 12 rondas de salt en producción.
- En tests se mockea bcrypt para no depender del binario nativo.
- No se almacenan en texto plano en ningún momento.

## Variables de entorno

- Los secretos (`JWT_SECRET`, `OPENAI_API_KEY`, `DATABASE_URL`) se configuran via `.env` (nunca en el código).
- `.env` está en `.gitignore`. El repositorio incluye únicamente `.env.example`.
- La aplicación no falla si `OPENAI_API_KEY` no está presente (usa fallback).

## Validación de entradas

- Todos los inputs HTTP se validan con **Zod** antes de llegar a los casos de uso.
- Los errores de Zod devuelven 400 con detalles por campo, sin exponer stack traces.

## CORS

- Configurado via `CORS_ORIGIN` (por defecto `*` en desarrollo, debe restringirse en producción).

## Mensajes de error seguros

- El middleware de error (`errorHandler`) nunca expone detalles del stack en producción.
- Errores no controlados devuelven `500` con mensaje genérico.

## Recomendaciones para producción

- Usar HTTPS con TLS terminado en el reverse proxy (nginx, Cloudflare).
- Restringir `CORS_ORIGIN` al dominio del frontend.
- Rotar `JWT_SECRET` periódicamente.
- Habilitar rate limiting en los endpoints de auth.
- Actualizar dependencias regularmente (`npm audit`).
