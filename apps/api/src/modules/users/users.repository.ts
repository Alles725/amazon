import { AddressInput, SavedAddress } from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
import { ApiError } from '../../common/api-error';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UserRecord, UserWithSecret, UsersApi, normalizeEmail } from './users.api';

const publicFields = { id: true, email: true, displayName: true, createdAt: true } as const;

@Injectable()
export class UsersRepository implements UsersApi {
  constructor(private readonly prisma: PrismaService) {}

  async listAddresses(userId: string): Promise<SavedAddress[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return addresses.map(publicAddress);
  }
  async findAddress(
    userId: string,
    id: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<SavedAddress | null> {
    const address = await tx.address.findFirst({ where: { id, userId } });
    return address ? publicAddress(address) : null;
  }
  async saveAddress(userId: string, input: AddressInput, id?: string): Promise<SavedAddress> {
    if (!id) return publicAddress(await this.prisma.address.create({ data: { ...input, userId } }));
    const updated = await this.prisma.address.updateMany({ where: { id, userId }, data: input });
    if (!updated.count) throw ApiError.notFound('Address');
    return (await this.findAddress(userId, id))!;
  }

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

function publicAddress(
  address: Omit<AddressInput, 'complement'> & { id: string; complement: string | null },
): SavedAddress {
  const { id, recipient, postalCode, street, number, complement, neighborhood, city, state } =
    address;
  return {
    id,
    recipient,
    postalCode,
    street,
    number,
    ...(complement ? { complement } : {}),
    neighborhood,
    city,
    state,
  };
}
