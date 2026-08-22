import { Injectable } from '@nestjs/common';
import { Algorithm, hash, verify } from '@node-rs/argon2';

/**
 * Argon2id with OWASP-recommended baseline parameters (19 MiB, t=2, p=1).
 * Tune memoryCost upward when the API pods get more memory headroom.
 */
const OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

@Injectable()
export class PasswordService {
  hash(plaintext: string): Promise<string> {
    return hash(plaintext, OPTIONS);
  }

  async verify(passwordHash: string, plaintext: string): Promise<boolean> {
    try {
      return await verify(passwordHash, plaintext, OPTIONS);
    } catch {
      // Malformed/legacy hash: treat as a failed login rather than a 500.
      return false;
    }
  }
}
