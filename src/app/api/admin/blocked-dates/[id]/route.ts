import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blockedDates } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAuth();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    await db.delete(blockedDates).where(eq(blockedDates.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
  }
}
