import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Round from '@/lib/db/models/Round';
import { getCurrentRoundWindow } from '@/lib/utils/rounds';
import { WINROLL_CONTRACT_ADDRESS, STAKE_TOKEN_DECIMALS } from '@/lib/web3/constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Returns the round currently open (or about to open) for betting. The
 * round doc itself is created/committed on-chain by winroll-cron; this
 * endpoint reports the computed window even before that doc exists so the
 * UI can show a countdown immediately.
 */
export async function GET() {
  try {
    await connectDB();

    const window = getCurrentRoundWindow();
    const round = await Round.findOne({ roundId: window.roundId }).lean();

    return NextResponse.json({
      success: true,
      data: {
        roundId: window.roundId,
        openTime: window.openTime,
        cutoffTime: window.cutoffTime,
        revealTime: window.revealTime,
        isClosed: window.isClosed,
        status: round?.status || 'scheduled',
        commitHash: round?.commitHash || null,
        contractAddress: WINROLL_CONTRACT_ADDRESS,
        stakeTokenDecimals: STAKE_TOKEN_DECIMALS,
      },
    });
  } catch (error) {
    console.error('Get current round error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load current round' }, { status: 500 });
  }
}
