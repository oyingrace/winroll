import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Round from '@/lib/db/models/Round';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { roundId } = await params;

    await connectDB();

    const round = await Round.findOne({ roundId }).lean();
    if (!round) {
      return NextResponse.json({ success: false, error: 'Round not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: round });
  } catch (error) {
    console.error('Get round error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load round' }, { status: 500 });
  }
}
