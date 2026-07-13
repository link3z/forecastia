import type { Request, Response } from 'express';

import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/GetCurrentUserUseCase.js';
import { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUserUseCase.js';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUserUseCase.js';
import { LoginSchema, RegisterSchema } from '../../../application/dtos/auth.dto.js';
import { passwordHasher, tokenService } from '../../../infrastructure/auth/index.js';
import { userRepository } from '../../../infrastructure/repositories/index.js';

function toPublicUser(user: { id: string; name: string; email: string; createdAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = RegisterSchema.parse(req.body);
  const useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  const user = await useCase.execute(input);
  res.status(201).json({ user: toPublicUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = LoginSchema.parse(req.body);
  const useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
  const { token, user } = await useCase.execute(input);
  res.status(200).json({ token, user: toPublicUser(user) });
}

export async function me(req: Request, res: Response): Promise<void> {
  const useCase = new GetCurrentUserUseCase(userRepository);
  const user = await useCase.execute(req.userId!);
  res.status(200).json({ user: toPublicUser(user) });
}
