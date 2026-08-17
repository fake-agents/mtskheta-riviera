import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

type RouteParams = { params: Promise<{ id: string }> };

// Admin: update booking status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await verifyAuth();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const { status } = await request.json();

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const [updated] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// Admin: delete a booking
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await verifyAuth();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    await db.delete(bookings).where(eq(bookings.id, bookingId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
