import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dailyIncomes } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await db.select().from(dailyIncomes);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch incomes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { date, rawInput } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Parse raw input e.g. "120, 150, 200" or empty string
    let tripsCount = 0;
    let totalGel = 0;
    let cleanRawInput = (rawInput || '').trim();

    if (cleanRawInput) {
      // Split by commas, semi-colons, or spaces
      const parts = cleanRawInput.split(/[,;\s]+/).filter(Boolean);
      const numbers = parts.map((p: string) => parseInt(p.replace(/\D/g, ''), 10)).filter((n: number) => !isNaN(n));
      
      tripsCount = numbers.length;
      totalGel = numbers.reduce((acc: number, curr: number) => acc + curr, 0);
      
      // Keep it cleanly formatted
      cleanRawInput = numbers.join(', ');
    }

    // Check if entry for date already exists
    const existing = await db.select().from(dailyIncomes).where(eq(dailyIncomes.date, date));

    if (existing.length > 0) {
      if (tripsCount === 0) {
        // If empty, delete it
        await db.delete(dailyIncomes).where(eq(dailyIncomes.date, date));
        return NextResponse.json({ success: true, deleted: true });
      } else {
        // Update
        const [updated] = await db.update(dailyIncomes)
          .set({ rawInput: cleanRawInput, tripsCount, totalGel })
          .where(eq(dailyIncomes.date, date))
          .returning();
        return NextResponse.json(updated);
      }
    } else {
      if (tripsCount === 0) {
        return NextResponse.json({ success: true, nothingTodo: true });
      }
      
      // Insert
      const [inserted] = await db.insert(dailyIncomes)
        .values({ date, rawInput: cleanRawInput, tripsCount, totalGel })
        .returning();
      return NextResponse.json(inserted, { status: 201 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save income' }, { status: 500 });
  }
}
