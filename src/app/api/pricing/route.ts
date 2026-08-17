import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pricingTiers } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// Public: fetch all pricing tiers
export async function GET() {
  try {
    const tiers = await db.select().from(pricingTiers).orderBy(pricingTiers.minGuests);
    return NextResponse.json(tiers);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

// Admin: create a new pricing tier
export async function POST(request: NextRequest) {
  const admin = await verifyAuth();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { minGuests, maxGuests, priceGel } = await request.json();
    if (!minGuests || !maxGuests || !priceGel) {
      return NextResponse.json({ error: 'minGuests, maxGuests, and priceGel are required' }, { status: 400 });
    }

    const [tier] = await db.insert(pricingTiers).values({
      minGuests,
      maxGuests,
      priceGel,
    }).returning();

    return NextResponse.json(tier, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create pricing tier' }, { status: 500 });
  }
}

// Admin: update a pricing tier
export async function PUT(request: NextRequest) {
  const admin = await verifyAuth();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, minGuests, maxGuests, priceGel } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const [updated] = await db.update(pricingTiers)
      .set({ minGuests, maxGuests, priceGel, updatedAt: new Date() })
      .where(eq(pricingTiers.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update pricing tier' }, { status: 500 });
  }
}

// Admin: delete a pricing tier
export async function DELETE(request: NextRequest) {
  const admin = await verifyAuth();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await db.delete(pricingTiers).where(eq(pricingTiers.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete pricing tier' }, { status: 500 });
  }
}
