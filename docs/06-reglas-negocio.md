# Reglas de Negocio

## Cierres diarios

- **RN-001**: La caja diaria (`revenue`) no puede ser negativa.
- **RN-002**: El número de tickets no puede ser negativo.
- **RN-003**: No puede existir más de un cierre por negocio y fecha.
- **RN-004**: Si se informan `revenue` y `tickets` (tickets > 0), el `averageTicket` se calcula como `revenue / tickets`.
- **RN-005**: Cada creación, importación o edición de un cierre dispara la recalibración de métricas del negocio.

## Predicciones

- **RN-006**: El modelo heurístico requiere al menos 1 cierre histórico para generar predicción. Sin datos devuelve `expectedRevenue = 0`.
- **RN-007**: La base de la predicción se calcula como `0.4 × mediaGlobal + 0.4 × mediaDíaSemana + 0.2 × (mediaGlobal × (1 + tendenciaReciente))`.
- **RN-008**: Los ajustes por clima son: soleado +15%, parcialmente nublado +5%, nublado −5%, lluvia −20%, tormenta −35%.
- **RN-009**: Temperatura alta (>28°C) aplica +10%; temperatura baja (<18°C) aplica −10%.
- **RN-010**: Lluvia fuerte aplica −25%; lluvia ligera −10% (campo `rain` independiente del `weather`).
- **RN-011**: Evento activo aplica +20%; campaña activa +10%.
- **RN-012**: Los intervalos min/max se calculan usando la desviación típica histórica: `min = expected − σ`, `max = expected + σ`.
- **RN-013**: Las probabilidades de superar umbrales se calculan mediante aproximación de distribución normal (función erf).

## Autenticación

- **RN-014**: Las contraseñas se almacenan como hash bcrypt (12 rondas en producción).
- **RN-015**: El token JWT caduca según `JWT_EXPIRES_IN` (por defecto `7d`).
- **RN-016**: Ningún endpoint de negocio es accesible sin token válido.

## Exportaciones

- **RN-017**: Los CSV se exportan con BOM UTF-8 para compatibilidad con Excel en Windows.
- **RN-018**: El JSON de exportación incluye negocio, cierres, métricas y predicciones completos.
