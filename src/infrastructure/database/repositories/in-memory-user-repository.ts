import { User } from '@domain/entities/user';
import { UserRepository } from '@domain/repositories/user-repository';
import { getDatabase } from '../connection';

export class InMemoryUserRepository implements UserRepository {
  async create(user: User): Promise<void> {
    const db = getDatabase();
    db.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    return db.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = getDatabase();
    for (const user of db.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async update(user: User): Promise<void> {
    const db = getDatabase();
    db.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    db.users.delete(id);
  }
}
