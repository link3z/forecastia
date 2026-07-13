/**
 * Jerarquía de errores de dominio/aplicación. El middleware de errores
 * (presentation/http/middlewares/errorHandler.ts) los traduce a respuestas
 * HTTP seguras, sin exponer detalles internos.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DomainValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado.`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No autorizado.') {
    super(message, 403, 'FORBIDDEN');
  }
}
