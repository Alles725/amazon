import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UserRecord, UserWithSecret, UsersApi, normalizeEmail } from './users.api';

const publicFields = { id: true, email: true, displayName: true, createdAt: true } as const;

@Injectable()
export class UsersRepository implements UsersApi {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<UserRecord> {
    return this.prisma.user.create({
      data: { ...input, email: normalizeEmail(input.email) },
      select: publicFields,
    });
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id }, select: publicFields });
  }

  async findByEmailWithSecret(email: string): Promise<UserWithSecret | null> {
    return this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: { ...publicFields, passwordHash: true },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const found = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: { id: true },
    });
    return found !== null;
  }
}
