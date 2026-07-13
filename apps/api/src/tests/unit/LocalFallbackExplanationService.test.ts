import { describe, it, expect } from 'vitest';
import { LocalFallbackExplanationService } from '../../infrastructure/ai/LocalFallbackExplanationService.js';
import type { ExplanationData } from '../../domain/services/ExplanationService.js';

const service = new LocalFallbackExplanationService();

const baseData: ExplanationData = {
  businessName: 'Chiringuito O Solpor',
  targetDate: new Date('2024-07-20'),
  expectedRevenue: 450,
  minRevenue: 300,
  maxRevenue: 600,
  pessimisticScenario: 300,
  optimisticScenario: 600,
  probabilities: { '100': 0.95, '300': 0.75, '500': 0.3 },
  influencingFactors: [
    { factor: 'clima', effect: 0.15, description: 'Clima soleado favorece la afluencia.' },
    { factor: 'dia_semana', effect: 0.05, description: 'Sábado por encima de la media.' },
  ],
  inputVariables: { weather: 'soleado', event: null },
};

describe('LocalFallbackExplanationService', () => {
  it('genera una explicación no vacía', async () => {
    const result = await service.explain(baseData);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(50);
  });

  it('incluye el nombre del negocio en la explicación', async () => {
    const result = await service.explain(baseData);
    expect(result).toContain('Chiringuito O Solpor');
  });

  it('incluye la caja esperada en la explicación', async () => {
    const result = await service.explain(baseData);
    // La cifra debe aparecer formateada (€ o el número)
    expect(result).toMatch(/450|€/);
  });

  it('menciona factores positivos cuando los hay', async () => {
    const result = await service.explain(baseData);
    // La explicación debe mencionar al menos uno de los factores
    expect(result.toLowerCase()).toMatch(/clima|día|sábado|factor/);
  });

  it('funciona con datos mínimos (sin factores influyentes)', async () => {
    const minimal: ExplanationData = {
      ...baseData,
      influencingFactors: [],
      probabilities: {},
    };
    const result = await service.explain(minimal);
    expect(result).toBeTruthy();
  });
});
