import { createHash, timingSafeEqual } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { verify } from 'argon2';
import { jwtVerify, SignJWT } from 'jose';

import { AuthUser } from '@campus/contracts';

import { APP_CONFIG, type AppConfig } from '#src/config/app-config.js';

const AUDIENCE = 'campus-admin';
const ALGORITHM = 'HS256';

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

@Injectable()
export class AuthService {
  private readonly key: Uint8Array;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.key = new TextEncoder().encode(config.env.JWT_SECRET);
  }

  /**
   * Checks the single env admin (docs/03-architecture.md → Security). The password hash is
   * always verified, even for an unknown email, so timing doesn't reveal which part was
   * wrong. Returns null on any mismatch.
   */
  async verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
    const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = this.config.env;
    const passwordOk = await verify(ADMIN_PASSWORD_HASH, password).catch(() => false);
    const emailOk = timingSafeEqual(digest(email.toLowerCase()), digest(ADMIN_EMAIL));
    return emailOk && passwordOk ? { email: ADMIN_EMAIL, role: 'admin' } : null;
  }

  /** A signed session token that expires after `JWT_TTL`. */
  issueToken(user: AuthUser): Promise<string> {
    return new SignJWT({ role: user.role })
      .setProtectedHeader({ alg: ALGORITHM })
      .setSubject(user.email)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(`${this.config.env.JWT_TTL}s`)
      .sign(this.key);
  }

  /**
   * The session's user, or null when the token is missing, tampered, expired, or names
   * someone other than the current admin (so changing `ADMIN_EMAIL` ends old sessions).
   */
  async verifyToken(token: string | undefined): Promise<AuthUser | null> {
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, this.key, {
        algorithms: [ALGORITHM],
        audience: AUDIENCE,
      });
      const user = AuthUser.safeParse({ email: payload.sub, role: payload.role });
      return user.success && user.data.email === this.config.env.ADMIN_EMAIL ? user.data : null;
    } catch {
      return null;
    }
  }
}
