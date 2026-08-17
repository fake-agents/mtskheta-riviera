import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allSettings = await db.select().from(settings);
    const settingsMap = allSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    // Upsert the setting
    await db.insert(settings)
      .values({ key, value: String(value) })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(value), updatedAt: new Date() }
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
