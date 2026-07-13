import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { Forecast } from '../../../domain/entities/Forecast.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';
import type { ForecastRepository } from '../../../domain/repositories/ForecastRepository.js';
import type { PredictiveVariableConfigRepository } from '../../../domain/repositories/PredictiveVariableConfigRepository.js';
import { HeuristicForecastService } from '../../../domain/services/HeuristicForecastService.js';
import type { ExplanationService } from '../../../domain/services/ExplanationService.js';
import type { GenerateForecastInput } from '../../dtos/forecast.dto.js';

/**
 * CU-009 / CU-012 — Genera una predicción de caja para una fecha futura usando el
 * modelo heurístico explicable (HeuristicForecastService) y enriquece el resultado
 * con una explicación en lenguaje natural (ExplanationService).
 */
export class GenerateForecastUseCase {
  private readonly forecastService = new HeuristicForecastService();

  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly dailyRecordRepository: DailyRecordRepository,
    private readonly predictiveVariableConfigRepository: PredictiveVariableConfigRepository,
    private readonly forecastRepository: ForecastRepository,
    private readonly explanationService: ExplanationService,
  ) {}

  async execute(userId: string, businessId: string, input: GenerateForecastInput): Promise<Forecast> {
    // 1. Comprobar que el negocio existe y pertenece al usuario
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) {
      throw new NotFoundError('Negocio');
    }

    // 2. Cargar histórico de cierres
    const records = await this.dailyRecordRepository.findAllByBusiness(businessId);

    // 3. Cargar configuración de variables predictivas
    const config = await this.predictiveVariableConfigRepository.findByBusinessId(businessId);
    if (!config) {
      throw new NotFoundError('Configuración de variables predictivas');
    }

    // 4. Obtener umbrales del negocio
    const thresholds = Array.isArray(business.thresholds)
      ? (business.thresholds as number[])
      : [100, 200, 300, 500, 1000];

    // 5. Calcular predicción heurística
    const result = this.forecastService.compute(records, input, config, thresholds);

    // 6. Generar explicación en lenguaje natural (OpenAI o fallback local)
    let aiExplanation: string | null = null;
    try {
      aiExplanation = await this.explanationService.explain({
        businessName: business.name,
        targetDate: input.targetDate,
        expectedRevenue: result.expectedRevenue,
        minRevenue: result.minRevenue,
        maxRevenue: result.maxRevenue,
        pessimisticScenario: result.pessimisticScenario,
        optimisticScenario: result.optimisticScenario,
        probabilities: result.probabilities,
        influencingFactors: result.influencingFactors,
        inputVariables: input as Record<string, unknown>,
      });
    } catch (err) {
      console.error('[GenerateForecastUseCase] Error al generar explicación:', err);
    }

    // 7. Persistir y devolver la predicción
    const forecast = await this.forecastRepository.create({
      businessId,
      targetDate: new Date(input.targetDate),
      expectedRevenue: result.expectedRevenue,
      minRevenue: result.minRevenue,
      maxRevenue: result.maxRevenue,
      pessimisticScenario: result.pessimisticScenario,
      averageScenario: result.expectedRevenue,
      optimisticScenario: result.optimisticScenario,
      probabilities: result.probabilities,
      influencingFactors: result.influencingFactors,
      aiExplanation,
      inputVariables: input as Record<string, unknown>,
    });

    return forecast;
  }
}
