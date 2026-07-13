import { describe, expect, it } from 'vitest';

import { LoginUserUseCase } from '../../src/application/use-cases/auth/LoginUserUseCase.js';
import { RegisterUserUseCase } from '../../src/application/use-cases/auth/RegisterUserUseCase.js';
import { ConflictError, UnauthorizedError } from '../../src/domain/errors/AppError.js';
import type { NewUser, User } from '../../src/domain/entities/User.js';
import type { UserRepository } from '../../src/domain/repositories/UserRepository.js';
import type { PasswordHasher } from '../../src/application/ports/PasswordHasher.js';
import type { TokenService } from '../../src/application/ports/TokenService.js';

class FakeUserRepository implements UserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(data: NewUser): Promise<User> {
    const user: User = { id: crypto.randomUUID(), createdAt: new Date(), ...data };
    this.users.push(user);
    return user;
  }
}

const fakeHasher: PasswordHasher = {
  async hash(plain) {
    return `hashed:${plain}`;
  },
  async compare(plain, hash) {
    return hash === `hashed:${plain}`;
  },
};

const fakeTokenService: TokenService = {
  sign({ userId }) {
    return `token-for-${userId}`;
  },
  verify(token) {
    return { userId: token.replace('token-for-', '') };
  },
};

describe('RegisterUserUseCase', () => {
  it('crea un usuario nuevo con el password hasheado', async () => {
    const repo = new FakeUserRepository();
    const useCase = new RegisterUserUseCase(repo, fakeHasher);

    const user = await useCase.execute({
      name: 'Javier',
      email: 'javier@example.com',
      password: 'Demo1234!',
    });

    expect(user.email).toBe('javier@example.com');
    expect(user.passwordHash).toBe('hashed:Demo1234!');
  });

  it('lanza ConflictError si el email ya existe', async () => {
    const repo = new FakeUserRepository();
    const useCase = new RegisterUserUseCase(repo, fakeHasher);
    await useCase.execute({ name: 'A', email: 'dup@example.com', password: 'Demo1234!' });

    await expect(
      useCase.execute({ name: 'B', email: 'dup@example.com', password: 'Demo1234!' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('LoginUserUseCase', () => {
  it('devuelve un token cuando las credenciales son correctas', async () => {
    const repo = new FakeUserRepository();
    await new RegisterUserUseCase(repo, fakeHasher).execute({
      name: 'Demo',
      email: 'demo@forecastia.app',
      password: 'Demo1234!',
    });

    const useCase = new LoginUserUseCase(repo, fakeHasher, fakeTokenService);
    const { token, user } = await useCase.execute({
      email: 'demo@forecastia.app',
      password: 'Demo1234!',
    });

    expect(token).toBe(`token-for-${user.id}`);
  });

  it('lanza UnauthorizedError con password incorrecto', async () => {
    const repo = new FakeUserRepository();
    await new RegisterUserUseCase(repo, fakeHasher).execute({
      name: 'Demo',
      email: 'demo@forecastia.app',
      password: 'Demo1234!',
    });

    const useCase = new LoginUserUseCase(repo, fakeHasher, fakeTokenService);
    await expect(
      useCase.execute({ email: 'demo@forecastia.app', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
