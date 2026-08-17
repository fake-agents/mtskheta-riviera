import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const COOKIE_NAME = 'riviera-admin-token';

interface AdminCredential {
  email: string;
  passwordHash: string;
  role?: 'admin' | 'staff';
}

/** Parse the ADMIN_CREDENTIALS env var (JSON array). */
function getAdminCredentials(): AdminCredential[] {
  try {
    console.log("process.env.ADMIN_CREDENTIALS is:", process.env.ADMIN_CREDENTIALS);
    return JSON.parse(process.env.ADMIN_CREDENTIALS || '[]');
  } catch (err) {
    console.error("Error parsing ADMIN_CREDENTIALS:", err);
    return [];
  }
}

/** Validate email + password against the credentials list. */
export async function validateAdmin(email: string, password: string): Promise<AdminCredential | null> {
  const admins = getAdminCredentials();
  const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return null;
  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) return null;
  return admin;
}

/** Create a signed JWT for the given admin email and role (24-hour expiry). */
export function createToken(email: string, role: string = 'admin'): string {
  return jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '24h' });
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
