import type { NewUser, User } from '../entities/User.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: NewUser): Promise<User>;
}
