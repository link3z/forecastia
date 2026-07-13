import type { PrismaClient } from '@prisma/client';

import type { NewUser, User } from '../../domain/entities/User.js';
import type { UserRepository } from '../../domain/repositories/UserRepository.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: NewUser): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
