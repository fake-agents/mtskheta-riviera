import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, boats, pricingTiers, operatingHours, settings, blockedDates } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq, and, gte, lt, or, ne } from 'drizzle-orm';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const dynamic = 'force-dynamic';

// Public: GET bookings for a date (to show availability)
// Query param: ?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      // Admin: return all bookings (paginated)
      const admin = await verifyAuth();
      if (!admin) return NextResponse.json({ error: 'date param required for public access' }, { status: 400 });

      const allBookings = await db.select().from(bookings).orderBy(bookings.startTime);
      return NextResponse.json(allBookings);
    }

    // Parse the date and get bookings for that day +/- 1 day to ensure no timezone cutoff
    const dayStart = new Date(`${dateStr}T00:00:00`);
    dayStart.setDate(dayStart.getDate() - 1);
    
    const dayEnd = new Date(`${dateStr}T23:59:59`);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayBookings = await db.select({
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
    })
      .from(bookings)
      .where(
        and(
          gte(bookings.startTime, dayStart),
          lt(bookings.startTime, dayEnd),
          ne(bookings.status, 'cancelled'),
        )
      );

    const dayBlocks = await db.select().from(blockedDates).where(
      and(
        lt(blockedDates.startTime, dayEnd),
        gte(blockedDates.endTime, dayStart)
      )
    );

    // Map blocked dates as "bookings" with status = 'blocked' so the frontend calendar automatically blocks them
    const blocksAsBookings = dayBlocks.map(b => ({
      startTime: b.startTime,
      endTime: b.endTime,
      status: 'blocked'
    }));

    return NextResponse.json([...dayBookings, ...blocksAsBookings]);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// Public: POST create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, guestCount, startTime } = body;

    // ─── Validation ────────────────────────────────────────────
    if (!customerName || !customerPhone || !guestCount || !startTime) {
      return NextResponse.json(
        { error: 'customerName, customerPhone, guestCount, and startTime are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneNumber = parsePhoneNumberFromString(customerPhone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Calculate end time (30 min trip)
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    // Check operating hours for this day
    const dayOfWeek = start.getDay(); // 0=Sunday
    const dayHours = await db.select().from(operatingHours).where(eq(operatingHours.dayOfWeek, dayOfWeek));

    if (dayHours.length > 0 && dayHours[0].isClosed) {
      return NextResponse.json({ error: 'We are closed on this day' }, { status: 400 });
    }

    if (dayHours.length > 0) {
      const [openH, openM] = dayHours[0].openTime.split(':').map(Number);
      const [closeH, closeM] = dayHours[0].closeTime.split(':').map(Number);
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();

      if (startMinutes < openH * 60 + openM || endMinutes > closeH * 60 + closeM) {
        return NextResponse.json({ error: 'Selected time is outside operating hours' }, { status: 400 });
      }
    }

    // Check for overlapping bookings (non-cancelled)
    const overlapping = await db.select().from(bookings).where(
      and(
        ne(bookings.status, 'cancelled'),
        // Overlap condition: existing.start < new.end AND existing.end > new.start
        lt(bookings.startTime, end),
        gte(bookings.endTime, start),
      )
    );

    if (overlapping.length > 0) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
    }

    // Check for blocked dates (maintenance/holidays)
    const overlapsBlock = await db.select().from(blockedDates).where(
      and(
        lt(blockedDates.startTime, end),
        gte(blockedDates.endTime, start)
      )
    );

    if (overlapsBlock.length > 0) {
      return NextResponse.json({ error: 'This time slot is unavailable due to maintenance/holiday' }, { status: 409 });
    }

    // Get price for this guest count
    const tiers = await db.select().from(pricingTiers).orderBy(pricingTiers.minGuests);
    let priceGel = 0;
    for (const tier of tiers) {
      if (guestCount >= tier.minGuests && guestCount <= tier.maxGuests) {
        priceGel = tier.priceGel;
        break;
      }
    }
    // If no tier matches (very large group), use the highest tier price
    if (priceGel === 0 && tiers.length > 0) {
      priceGel = tiers[tiers.length - 1].priceGel;
    }

    // Get the first active boat (or default to 1)
    const activeBoats = await db.select().from(boats).where(eq(boats.isActive, true));
    const boatId = activeBoats.length > 0 ? activeBoats[0].id : 1;

    // Check if auto-confirm is enabled
    const settingRes = await db.select().from(settings).where(eq(settings.key, 'auto_confirm_bookings'));
    const isAutoConfirm = settingRes.length > 0 && settingRes[0].value === 'true';

    // Create the booking
    const [booking] = await db.insert(bookings).values({
      boatId,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone: phoneNumber.formatInternational(),
      guestCount,
      startTime: start,
      endTime: end,
      priceGel,
      status: isAutoConfirm ? 'confirmed' : 'pending',
    }).returning();

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
