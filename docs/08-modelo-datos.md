# Modelo de Datos

## Diagrama entidad-relación (simplificado)

```
User (1) ──── (N) Business (1) ──── (N) DailyRecord
                     │
                     ├── (1) PredictiveVariableConfig
                     ├── (1) BusinessMetrics
                     └── (N) Forecast
```

## Entidades

### User
| Campo         | Tipo      | Descripción                     |
|---------------|-----------|---------------------------------|
| id            | String    | UUID generado por Prisma        |
| name          | String    | Nombre del usuario              |
| email         | String    | Email único                     |
| passwordHash  | String    | Hash bcrypt de la contraseña    |
| createdAt     | DateTime  | Fecha de registro               |

### Business
| Campo        | Tipo     | Descripción                                  |
|--------------|----------|----------------------------------------------|
| id           | String   | UUID                                         |
| userId       | String   | FK → User                                    |
| name         | String   | Nombre del negocio                           |
| type         | String   | Tipo (chiringuito, cafetería, food truck…)   |
| location     | String   | Ubicación                                    |
| currency     | String   | Código ISO (EUR, USD…)                       |
| startDate    | DateTime | Inicio de actividad                          |
| isSeasonal   | Boolean  | ¿Negocio estacional?                         |
| seasonStart  | DateTime | Inicio de temporada (opcional)               |
| seasonEnd    | DateTime | Fin de temporada (opcional)                  |
| thresholds   | Json     | Umbrales de predicción [100, 200, 300…]      |
| createdAt    | DateTime |                                              |
| updatedAt    | DateTime |                                              |

### DailyRecord
| Campo          | Tipo     | Descripción                         |
|----------------|----------|-------------------------------------|
| id             | String   | UUID                                |
| businessId     | String   | FK → Business                       |
| date           | DateTime | Fecha del cierre (única por negocio)|
| revenue        | Decimal  | Caja del día                        |
| tickets        | Int      | Número de tickets                   |
| averageTicket  | Decimal  | Ticket medio (calculado)            |
| weather        | String?  | Condición meteorológica             |
| tempMax        | Decimal? | Temperatura máxima (°C)             |
| tempMin        | Decimal? | Temperatura mínima (°C)             |
| rain           | String?  | Intensidad de lluvia                |
| wind           | String?  | Intensidad de viento                |
| event          | String?  | Evento relevante del día            |
| campaign       | String?  | Campaña o promoción activa          |
| socialFollowers| Int?     | Seguidores en redes                 |
| observations   | String?  | Observaciones libres                |
| createdAt      | DateTime |                                     |
| updatedAt      | DateTime |                                     |

### Forecast
| Campo               | Tipo     | Descripción                            |
|---------------------|----------|----------------------------------------|
| id                  | String   | UUID                                   |
| businessId          | String   | FK → Business                          |
| targetDate          | DateTime | Fecha predicha                         |
| expectedRevenue     | Decimal  | Caja esperada                          |
| minRevenue          | Decimal  | Mínimo estimado                        |
| maxRevenue          | Decimal  | Máximo estimado                        |
| pessimisticScenario | Decimal  | Escenario pesimista                    |
| averageScenario     | Decimal  | Escenario medio                        |
| optimisticScenario  | Decimal  | Escenario optimista                    |
| probabilities       | Json     | {umbral: probabilidad}                 |
| influencingFactors  | Json     | [{factor, effect, description}]        |
| aiExplanation       | String?  | Explicación generada por IA            |
| inputVariables      | Json     | Variables de entrada usadas            |
| createdAt           | DateTime |                                        |

### BusinessMetrics
| Campo               | Tipo     | Descripción                        |
|---------------------|----------|------------------------------------|
| id                  | String   | UUID                               |
| businessId          | String   | FK única → Business                |
| totalRevenue        | Decimal  | Caja acumulada total               |
| averageDailyRevenue | Decimal  | Media diaria                       |
| totalTickets        | Int      | Total de tickets vendidos          |
| globalAverageTicket | Decimal  | Ticket medio global                |
| bestDay             | Json     | {date, revenue} del mejor día      |
| worstDay            | Json     | {date, revenue} del peor día       |
| recordsCount        | Int      | Número de cierres                  |
| recentTrend         | Decimal  | Tendencia reciente (ratio)         |
| updatedAt           | DateTime | Última recalibración               |
