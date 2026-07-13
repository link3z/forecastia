import type {
  NewPredictiveVariableConfig,
  PredictiveVariableConfig,
  PredictiveVariableConfigUpdate,
} from '../entities/PredictiveVariableConfig.js';

export interface PredictiveVariableConfigRepository {
  create(data: NewPredictiveVariableConfig): Promise<PredictiveVariableConfig>;
  findByBusinessId(businessId: string): Promise<PredictiveVariableConfig | null>;
  update(
    businessId: string,
    data: PredictiveVariableConfigUpdate,
  ): Promise<PredictiveVariableConfig>;
}
