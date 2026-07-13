import { prisma } from '../database/prisma.js';
import { PrismaBusinessMetricsRepository } from './PrismaBusinessMetricsRepository.js';
import { PrismaBusinessRepository } from './PrismaBusinessRepository.js';
import { PrismaDailyRecordRepository } from './PrismaDailyRecordRepository.js';
import { PrismaForecastRepository } from './PrismaForecastRepository.js';
import { PrismaPredictiveVariableConfigRepository } from './PrismaPredictiveVariableConfigRepository.js';
import { PrismaUserRepository } from './PrismaUserRepository.js';

/**
 * Composition root de repositorios: instancias únicas reutilizadas por los
 * controllers para construir los casos de uso en cada request.
 */
export const userRepository = new PrismaUserRepository(prisma);
export const businessRepository = new PrismaBusinessRepository(prisma);
export const predictiveVariableConfigRepository = new PrismaPredictiveVariableConfigRepository(
  prisma,
);
export const dailyRecordRepository = new PrismaDailyRecordRepository(prisma);
export const businessMetricsRepository = new PrismaBusinessMetricsRepository(prisma);
export const forecastRepository = new PrismaForecastRepository(prisma);
