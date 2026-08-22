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

export interface UsersApi {
  create(input: { email: string; passwordHash: string; displayName: string }): Promise<UserRecord>;
  findById(id: string): Promise<UserRecord | null>;
  findByEmailWithSecret(email: string): Promise<UserWithSecret | null>;
  existsByEmail(email: string): Promise<boolean>;
}

/** Emails are stored and compared in a single canonical form. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
