# Visión del Producto — ForecastIA

## Descripción

ForecastIA es una plataforma web inteligente para la **predicción de ingresos en pequeños negocios**. Permite a propietarios y gestores registrar el historial de caja diaria, analizar la evolución de sus ingresos y obtener predicciones de caja futura enriquecidas con explicaciones en lenguaje natural generadas por IA.

## Problema que resuelve

Los pequeños negocios (chiringuitos, cafeterías, food trucks, heladerías, terrazas) carecen de herramientas accesibles para:
- Registrar y visualizar su histórico de ventas de forma estructurada.
- Entender qué factores externos (clima, temperatura, eventos) afectan a sus ingresos.
- Anticipar la caja esperada en un día futuro para planificar personal, compras y operaciones.

## Propuesta de valor

- **Registro sencillo**: formulario de cierre diario con variables meteorológicas, eventos y campañas.
- **Dashboard de análisis**: evolución, métricas clave y comparativas multivariable.
- **Predicción explicable**: modelo heurístico con escenarios pesimista/medio/optimista.
- **IA generativa**: explicación en lenguaje natural de cada predicción (OpenAI o fallback local).
- **Exportación**: CSV, JSON y Markdown para usar los datos fuera de la plataforma.

## Caso de uso principal

Chiringuito O Solpor, negocio de playa estacional. El propietario registra cada cierre, importa el histórico de temporadas anteriores y genera predicciones para los próximos días antes de hacer el pedido de material o fijar el turno del personal.

## Alcance del TFM

- Aplicación web completa (React + Node/Express + PostgreSQL).
- Modelo predictivo heurístico, reemplazable por ML en el futuro.
- Integración opcional con OpenAI (GPT-4o-mini) para explicaciones naturales.
- Autenticación básica con JWT.
- Despliegue local via Docker Compose.
