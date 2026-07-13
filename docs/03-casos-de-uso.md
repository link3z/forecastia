# Casos de Uso

| ID      | Nombre                              | Actor          |
|---------|-------------------------------------|----------------|
| CU-001  | Crear negocio                       | Usuario        |
| CU-002  | Configurar variables predictivas    | Usuario        |
| CU-003  | Registrar cierre diario             | Usuario        |
| CU-004  | Importar histórico desde CSV        | Usuario        |
| CU-005  | Editar o corregir cierre            | Usuario        |
| CU-006  | Consultar evolución de caja         | Usuario        |
| CU-007  | Consultar métricas principales      | Usuario        |
| CU-008  | Comparar variables                  | Usuario        |
| CU-009  | Generar predicción de caja          | Usuario        |
| CU-010  | Calcular probabilidades de umbrales | Sistema        |
| CU-011  | Recalibrar modelo con nuevos cierres| Sistema        |
| CU-012  | Explicar predicción con IA          | Sistema IA     |
| CU-015  | Iniciar sesión / Registro           | Usuario        |
| CU-017  | Exportar datos (CSV / JSON)         | Usuario        |
| CU-018  | Exportar informe (Markdown)         | Usuario        |

## Descripción resumida

**CU-001 Crear negocio**: El usuario registra un negocio indicando nombre, tipo, ubicación, moneda, fecha de inicio, si es estacional y umbrales de predicción por defecto.

**CU-003 Registrar cierre diario**: El usuario introduce los datos de caja del día: importe total, número de tickets, condiciones meteorológicas, eventos y observaciones. El sistema calcula el ticket medio y recalibra las métricas.

**CU-004 Importar histórico CSV**: El usuario sube un fichero CSV con múltiples cierres. El sistema valida cada fila, reporta errores e ignora o sobrescribe duplicados según la opción elegida.

**CU-009 Generar predicción**: El usuario selecciona fecha y variables de entrada (clima, temperatura, evento…). El sistema aplica el modelo heurístico y devuelve caja esperada, escenarios y probabilidades.

**CU-012 Explicar predicción**: Tras calcular la predicción, el sistema llama a OpenAI (si está disponible) o usa la plantilla local para generar una explicación en español orientada al gestor.

**CU-011 Recalibrar modelo**: Cada vez que se crea, importa o edita un cierre, el sistema recalcula medias, tendencias y métricas del negocio (RecalibrateBusinessMetricsUseCase).
