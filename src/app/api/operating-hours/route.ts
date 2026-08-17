import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { operatingHours } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// Public: fetch operating hours for all days
export async function GET() {
  try {
    const hours = await db.select().from(operatingHours).orderBy(operatingHours.dayOfWeek);
    return NextResponse.json(hours);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch operating hours' }, { status: 500 });
  }
}

// Admin: upsert operating hours for a day
export async function PUT(request: NextRequest) {
  const admin = await verifyAuth();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { dayOfWeek, openTime, closeTime, isClosed } = await request.json();
    if (dayOfWeek === undefined || dayOfWeek === null) {
      return NextResponse.json({ error: 'dayOfWeek is required' }, { status: 400 });
    }

    // Check if entry exists for this day
    const existing = await db.select().from(operatingHours).where(eq(operatingHours.dayOfWeek, dayOfWeek));

    if (existing.length > 0) {
      const [updated] = await db.update(operatingHours)
        .set({ openTime, closeTime, isClosed })
        .where(eq(operatingHours.dayOfWeek, dayOfWeek))
        .returning();
      return NextResponse.json(updated);
    } else {
      const [created] = await db.insert(operatingHours)
        .values({ dayOfWeek, openTime, closeTime, isClosed })
        .returning();
      return NextResponse.json(created, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update operating hours' }, { status: 500 });
  }
}

// Admin: bulk update all days at once
export async function POST(request: NextRequest) {
  const admin = await verifyAuth();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { hours } = await request.json() as { hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[] };

    // Delete all existing then insert fresh
    await db.delete(operatingHours);
    if (hours && hours.length > 0) {
      await db.insert(operatingHours).values(hours);
    }

    const result = await db.select().from(operatingHours).orderBy(operatingHours.dayOfWeek);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to update operating hours' }, { status: 500 });
  }
}
