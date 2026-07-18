import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Bet from '@/lib/db/models/Bet';
import { getWalletAddressFromRequest, getOrCreateUser } from '@/lib/web3/serverIdentity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Lists the connected wallet's bet history, most recent first. */
export async function GET(request) {
  try {
    const walletAddress = getWalletAddressFromRequest(request);
    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'Wallet address required' }, { status: 400 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const user = await getOrCreateUser(walletAddress);
    const bets = await Bet.find({ user: user._id }).sort({ createdAt: -1 }).limit(limit).lean();

    return NextResponse.json({ success: true, data: bets });
  } catch (error) {
    console.error('List user bets error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load bets' }, { status: 500 });
  }
}
