import { NextResponse } from 'next/server';
import { isAddress, getAddress } from 'viem';
import connectDB from '@/lib/db/connection';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Creates the User for a connected MiniPay wallet if one doesn't exist yet. */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { walletAddress } = body || {};

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json({ success: false, error: 'Valid wallet address required' }, { status: 400 });
    }

    await connectDB();

    const normalized = getAddress(walletAddress).toLowerCase();
    let user = await User.findOne({ walletAddress: normalized });
    if (!user) {
      user = await User.create({ walletAddress: normalized });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Wallet sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync wallet' }, { status: 500 });
  }
}
