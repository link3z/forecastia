import type { ExplanationData, ExplanationService } from '../../domain/services/ExplanationService.js';

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Genera una explicación en lenguaje natural mediante plantilla sin depender
 * de ningún servicio externo. Se usa cuando OPENAI_API_KEY no está configurado.
 *
 * Cumple los requisitos del CU-012:
 *  - Por qué se estima esa caja.
 *  - Qué factores suben la previsión.
 *  - Qué factores la bajan.
 *  - Recomendación operativa básica.
 */
export class LocalFallbackExplanationService implements ExplanationService {
  async explain(data: ExplanationData): Promise<string> {
    const {
      businessName,
      targetDate,
      expectedRevenue,
      pessimisticScenario,
      optimisticScenario,
      probabilities,
      influencingFactors,
      inputVariables,
    } = data;

    const dayName = DAY_NAMES[targetDate.getUTCDay()] ?? '';
    const day = targetDate.getUTCDate();
    const monthName = MONTH_NAMES[targetDate.getUTCMonth()] ?? '';
    const year = targetDate.getUTCFullYear();

    const fmt = (v: number) =>
      new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

    // ── Párrafo 1: estimación base ────────────────────────────────────────────
    const baseFactor = influencingFactors.find((f) => f.factor === 'base_historica');
    const baseDesc = baseFactor
      ? ` ${baseFactor.description}.`
      : ' La estimación parte de los promedios históricos del negocio.';

    const p1 =
      `Para el ${dayName} ${day} de ${monthName} de ${year}, el modelo estima una caja de ` +
      `${fmt(expectedRevenue)} en ${businessName}.${baseDesc} ` +
      `El intervalo se sitúa entre ${fmt(pessimisticScenario)} (escenario pesimista) ` +
      `y ${fmt(optimisticScenario)} (escenario optimista).`;

    // ── Párrafo 2: factores que suben ─────────────────────────────────────────
    const positive = influencingFactors.filter((f) => f.effect > 0);
    let p2 = '';
    if (positive.length > 0) {
      const list = positive.map((f) => f.description).join('. ');
      p2 = `Factores que impulsan la previsión: ${list}.`;
    }

    // ── Párrafo 3: factores que bajan ─────────────────────────────────────────
    const negative = influencingFactors.filter((f) => f.effect < 0);
    let p3 = '';
    if (negative.length > 0) {
      const list = negative.map((f) => f.description).join('. ');
      p3 = `Factores que reducen la previsión: ${list}.`;
    }

    // ── Párrafo 4: probabilidades destacadas ──────────────────────────────────
    const highProb = Object.entries(probabilities)
      .filter(([, prob]) => prob >= 0.7)
      .map(([threshold]) => fmt(Number(threshold)));

    const lowProb = Object.entries(probabilities)
      .filter(([, prob]) => prob < 0.35)
      .map(([threshold]) => fmt(Number(threshold)));

    let p4 = '';
    if (highProb.length > 0) {
      p4 += `Alta probabilidad de superar: ${highProb.join(', ')}. `;
    }
    if (lowProb.length > 0) {
      p4 += `Baja probabilidad de alcanzar: ${lowProb.join(', ')}.`;
    }

    // ── Párrafo 5: recomendación operativa ───────────────────────────────────
    const p5 = buildRecommendation(expectedRevenue, positive, negative, inputVariables);

    return [p1, p2, p3, p4, p5].filter(Boolean).join(' ');
  }
}

function buildRecommendation(
  expectedRevenue: number,
  positive: Array<{ factor: string; effect: number }>,
  negative: Array<{ factor: string; effect: number }>,
  input: ExplanationData['inputVariables'],
): string {
  const hasEvent = positive.some((f) => f.factor === 'evento');
  const hasCampaign = positive.some((f) => f.factor === 'campaña');
  const hasBadWeather = negative.some(
    (f) => f.factor === 'clima' || f.factor === 'lluvia',
  );

  if (hasEvent && hasCampaign) {
    return (
      `Recomendación: jornada con gran potencial gracias al evento y la campaña activa. ` +
      `Considera reforzar el equipo y asegurar stock suficiente para un volumen elevado de clientes.`
    );
  }
  if (hasEvent) {
    return (
      `Recomendación: el evento previsto puede atraer más clientes de lo habitual. ` +
      `Prepara personal y suministros con margen adicional.`
    );
  }
  if (hasCampaign) {
    return (
      `Recomendación: la campaña activa puede incrementar la afluencia. ` +
      `Comunica la promoción con antelación para maximizar su impacto.`
    );
  }
  if (hasBadWeather) {
    const weatherLabel =
      input.weather ? `el tiempo previsto (${input.weather})` : 'las condiciones meteorológicas adversas';
    return (
      `Recomendación: ${weatherLabel} puede reducir la afluencia de clientes. ` +
      `Valora ajustar el personal de turno y priorizar el servicio a cubierto si está disponible.`
    );
  }
  if (expectedRevenue >= 600) {
    return (
      `Recomendación: se espera un día de alta demanda. ` +
      `Asegura el aprovisionamiento completo y coordina el equipo con antelación.`
    );
  }
  if (expectedRevenue <= 200) {
    return (
      `Recomendación: la previsión es moderada. ` +
      `Puede ser un buen momento para tareas de mantenimiento o formación interna.`
    );
  }
  return (
    `Recomendación: jornada dentro de la media histórica. ` +
    `Mantén la operativa habitual y revisa el stock para los próximos días.`
  );
}
