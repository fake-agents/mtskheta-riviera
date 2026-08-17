import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin, createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log("Login Attempt:", { email, password });
    const admin = await validateAdmin(email, password);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createToken(email, admin.role || 'admin');

    const response = NextResponse.json({ success: true, email });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Login Route Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
