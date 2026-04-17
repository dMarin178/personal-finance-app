import { User } from '@domain/entities/user';
import { UserRepository } from '@domain/repositories/user-repository';
import prisma from '../prisma-client';

export class PrismaUserRepository implements UserRepository {
  async create(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const dbUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!dbUser) return null;

    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.name,
      dbUser.passwordHash,
      dbUser.createdAt,
      dbUser.updatedAt
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) return null;

    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.name,
      dbUser.passwordHash,
      dbUser.createdAt,
      dbUser.updatedAt
    );
  }

  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
