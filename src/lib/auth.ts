import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const COOKIE_NAME = 'riviera-admin-token';

interface AdminCredential {
  email: string;
  passwordHash: string;
}

/** Parse the ADMIN_CREDENTIALS env var (JSON array). */
function getAdminCredentials(): AdminCredential[] {
  try {
    return JSON.parse(process.env.ADMIN_CREDENTIALS || '[]');
  } catch {
    return [];
  }
}

/** Validate email + password against the credentials list. */
export async function validateAdmin(email: string, password: string): Promise<boolean> {
  const admins = getAdminCredentials();
  const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

/** Create a signed JWT for the given admin email (24-hour expiry). */
export function createToken(email: string): string {
  return jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

/** Verify the JWT from the request cookies. Returns the payload or null. */
export async function verifyAuth(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string; role: string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
