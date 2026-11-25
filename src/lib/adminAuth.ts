import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'sammys_manager_session';

function getSecret(): string {
  return process.env.MANAGER_SESSION_SECRET || process.env.MANAGER_PASSCODE || 'sammys-kimberley-manager-secret-2026';
}

export function getExpectedPasscode(): string {
  return process.env.MANAGER_PASSCODE || 'SAMYS2026';
}

export function createAdminSessionToken(): string {
  const payload = `manager:${Date.now()}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (!payload.startsWith('manager:')) return false;

  const expectedSig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch {
    return false;
  }
}
