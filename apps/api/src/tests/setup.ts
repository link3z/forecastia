import { vi } from 'vitest';

// Variables de entorno mínimas para tests
process.env['JWT_SECRET'] = 'test-jwt-secret-forecastia-2024';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['NODE_ENV'] = 'test';

// Silenciar console.error en los tests para no contaminar la salida
vi.spyOn(console, 'error').mockImplementation(() => {});
