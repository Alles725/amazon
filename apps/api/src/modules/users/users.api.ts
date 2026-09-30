import { AccountAddress, AddressInput, SavedAddress } from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
/**
 * Cross-module application interface. Other modules (auth, orders, ...) depend on
 * this token, never on UsersRepository or the Prisma model.
 */
export const USERS_API = 'USERS_API';

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export interface UserWithSecret extends UserRecord {
  passwordHash: string;
}

export const USER_ADDRESSES_API = 'USER_ADDRESSES_API';
export interface UserAddressesApi {
  /** Default address first, then oldest first (checkout preselects the first one). */
  listAddresses(userId: string): Promise<AccountAddress[]>;
  /** The first address a user saves becomes the default. */
  saveAddress(userId: string, input: AddressInput, id?: string): Promise<AccountAddress>;
  /** Deleting the default promotes the oldest remaining address. */
  deleteAddress(userId: string, id: string): Promise<AccountAddress[]>;
  setDefaultAddress(userId: string, id: string): Promise<AccountAddress[]>;
  findAddress(
    userId: string,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<SavedAddress | null>;
}

export interface UsersApi {
  create(input: { email: string; passwordHash: string; displayName: string }): Promise<UserRecord>;
  findById(id: string): Promise<UserRecord | null>;
  findByEmailWithSecret(email: string): Promise<UserWithSecret | null>;
  existsByEmail(email: string): Promise<boolean>;
  findByIdWithSecret(id: string): Promise<UserWithSecret | null>;
  updateDisplayName(id: string, displayName: string): Promise<UserRecord>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  /** Throws Prisma's unique violation (P2002) when the email is taken. */
  updateEmail(id: string, email: string): Promise<UserRecord>;
}

/** Emails are stored and compared in a single canonical form. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
