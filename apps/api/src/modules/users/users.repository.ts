import { AccountAddress, AddressInput, SavedAddress } from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
import { ApiError } from '../../common/api-error';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  UserAddressesApi,
  UserRecord,
  UserWithSecret,
  UsersApi,
  normalizeEmail,
} from './users.api';

const publicFields = { id: true, email: true, displayName: true, createdAt: true } as const;

@Injectable()
export class UsersRepository implements UsersApi, UserAddressesApi {
  constructor(private readonly prisma: PrismaService) {}

  async listAddresses(userId: string): Promise<AccountAddress[]> {
    return this.addressesOf(userId, this.prisma);
  }
  async findAddress(
    userId: string,
    id: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<SavedAddress | null> {
    const address = await tx.address.findFirst({ where: { id, userId } });
    return address ? publicAddress(address) : null;
  }
  async saveAddress(userId: string, input: AddressInput, id?: string): Promise<AccountAddress> {
    if (!id)
      return this.withAddressLock(userId, async (tx) => {
        const hasDefault = await tx.address.count({ where: { userId, isDefault: true } });
        const created = await tx.address.create({
          data: { ...input, userId, isDefault: hasDefault === 0 },
        });
        return publicAddress(created);
      });
    const updated = await this.prisma.address.updateMany({ where: { id, userId }, data: input });
    if (!updated.count) throw ApiError.notFound('Address');
    return publicAddress(await this.prisma.address.findFirstOrThrow({ where: { id, userId } }));
  }
  async deleteAddress(userId: string, id: string): Promise<AccountAddress[]> {
    return this.withAddressLock(userId, async (tx) => {
      const address = await tx.address.findFirst({ where: { id, userId } });
      if (!address) throw ApiError.notFound('Address');
      await tx.address.delete({ where: { id } });
      if (address.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        });
        if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
      return this.addressesOf(userId, tx);
    });
  }
  async setDefaultAddress(userId: string, id: string): Promise<AccountAddress[]> {
    return this.withAddressLock(userId, async (tx) => {
      if (!(await tx.address.count({ where: { id, userId } }))) throw ApiError.notFound('Address');
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
      await tx.address.update({ where: { id }, data: { isDefault: true } });
      return this.addressesOf(userId, tx);
    });
  }

  private async addressesOf(
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<AccountAddress[]> {
    const addresses = await tx.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
    return addresses.map(publicAddress);
  }

  /** Serializes default-address changes per account, so "one default" holds
   * without a partial unique index (which Prisma's schema cannot express). */
  private withAddressLock<T>(
    userId: string,
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const key = `addresses:${userId}`;
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text`;
      return work(tx);
    });
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

  async findByIdWithSecret(id: string): Promise<UserWithSecret | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { ...publicFields, passwordHash: true },
    });
  }

  async updateDisplayName(id: string, displayName: string): Promise<UserRecord> {
    return this.prisma.user.update({ where: { id }, data: { displayName }, select: publicFields });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash }, select: { id: true } });
  }

  async updateEmail(id: string, email: string): Promise<UserRecord> {
    return this.prisma.user.update({
      where: { id },
      data: { email: normalizeEmail(email) },
      select: publicFields,
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
  address: Omit<AddressInput, 'complement' | 'phone' | 'deliveryInstructions'> & {
    id: string;
    complement: string | null;
    phone: string | null;
    deliveryInstructions: string | null;
    isDefault: boolean;
  },
): AccountAddress {
  const {
    id,
    recipient,
    postalCode,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    phone,
    deliveryInstructions,
    isDefault,
  } = address;
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
    ...(phone ? { phone } : {}),
    ...(deliveryInstructions ? { deliveryInstructions } : {}),
    isDefault,
  };
}
