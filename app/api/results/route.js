import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Round from '@/lib/db/models/Round';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Lists recent revealed rounds (dice results), most recent first. */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const results = await Round.find({ status: 'revealed' })
      .sort({ revealedAt: -1 })
      .limit(limit)
      .select('roundId die1 die2 sum isDouble revealTxHash revealedAt')
      .lean();

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('List results error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load results' }, { status: 500 });
  }
}
