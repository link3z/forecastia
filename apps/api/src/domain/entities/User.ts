export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export type NewUser = Omit<User, 'id' | 'createdAt'>;
