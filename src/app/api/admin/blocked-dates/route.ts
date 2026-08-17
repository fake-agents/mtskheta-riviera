import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blockedDates, boats } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await db.select().from(blockedDates).orderBy(desc(blockedDates.startTime));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { startTime, endTime, reason } = body;

    if (!startTime || !endTime) {
      return NextResponse.json({ error: 'startTime and endTime are required' }, { status: 400 });
    }

    // Get the first active boat
    const activeBoats = await db.select().from(boats).where(eq(boats.isActive, true));
    const boatId = activeBoats.length > 0 ? activeBoats[0].id : 1;

    const [newBlock] = await db.insert(blockedDates).values({
      boatId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason: reason || null,
    }).returning();

    return NextResponse.json(newBlock, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to block dates' }, { status: 500 });
  }
}
