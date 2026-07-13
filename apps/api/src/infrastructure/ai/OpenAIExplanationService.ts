import OpenAI from 'openai';

import type { ExplanationData, ExplanationService } from '../../domain/services/ExplanationService.js';

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Genera una explicación en lenguaje natural usando la API de OpenAI (CU-012).
 *
 * Usa gpt-4o-mini (coste mínimo, respuesta rápida) y limita la respuesta a
 * ~250 tokens para mantener la explicación concisa y útil para el gestor.
 */
export class OpenAIExplanationService implements ExplanationService {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async explain(data: ExplanationData): Promise<string> {
    const prompt = buildPrompt(data);

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente de análisis de negocio para pequeños comercios y hostelería. ' +
            'Explica predicciones de caja de forma clara, directa y útil para un gestor sin conocimientos técnicos. ' +
            'Responde siempre en español. Sé conciso: 3-4 frases como máximo.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() ?? '';
  }
}

function buildPrompt(data: ExplanationData): string {
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

  const fmt = (v: number) => `${v.toFixed(2)} €`;

  const factorsText = influencingFactors
    .filter((f) => f.factor !== 'base_historica')
    .map((f) => `  - ${f.description} (efecto: ${f.effect > 0 ? '+' : ''}${(f.effect * 100).toFixed(0)}%)`)
    .join('\n');

  const probText = Object.entries(probabilities)
    .map(([t, p]) => `${t} €: ${(Number(p) * 100).toFixed(0)}%`)
    .join(', ');

  const condiciones: string[] = [];
  if (inputVariables.weather) condiciones.push(`clima: ${inputVariables.weather}`);
  if (inputVariables.tempMax != null) condiciones.push(`temp. máx: ${inputVariables.tempMax}°C`);
  if (inputVariables.rain) condiciones.push(`lluvia: ${inputVariables.rain}`);
  if (inputVariables.event) condiciones.push(`evento: ${inputVariables.event}`);
  if (inputVariables.campaign) condiciones.push(`campaña: ${inputVariables.campaign}`);

  return (
    `Negocio: ${businessName}\n` +
    `Fecha: ${dayName} ${day} de ${monthName} de ${year}\n` +
    `Caja esperada: ${fmt(expectedRevenue)} (pesimista ${fmt(pessimisticScenario)}, optimista ${fmt(optimisticScenario)})\n` +
    `Condiciones del día: ${condiciones.length > 0 ? condiciones.join(', ') : 'sin datos adicionales'}\n` +
    `Factores aplicados al modelo:\n${factorsText || '  (ninguno adicional a la media histórica)'}\n` +
    `Probabilidades de superar umbrales: ${probText}\n\n` +
    `Explica de forma clara y práctica:\n` +
    `1. Por qué se estima esa caja.\n` +
    `2. Qué factores la suben o la bajan.\n` +
    `3. Una recomendación operativa concreta para el gestor.`
  );
}
