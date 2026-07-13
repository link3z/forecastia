import type { ExplanationService } from '../../domain/services/ExplanationService.js';
import { LocalFallbackExplanationService } from './LocalFallbackExplanationService.js';
import { OpenAIExplanationService } from './OpenAIExplanationService.js';

/**
 * Devuelve el servicio de explicación adecuado según el entorno.
 *
 * - Si OPENAI_API_KEY está definido → OpenAIExplanationService.
 * - Si no → LocalFallbackExplanationService (plantilla local, sin coste).
 *
 * La aplicación funciona completamente sin OPENAI_API_KEY (CU-012, requisito #17).
 */
export function createExplanationService(): ExplanationService {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (apiKey && apiKey.trim().length > 0) {
    return new OpenAIExplanationService(apiKey.trim());
  }
  return new LocalFallbackExplanationService();
}
