import { NextResponse } from 'next/server';
import { getAddress, parseEventLogs } from 'viem';
import connectDB from '@/lib/db/connection';
import Bet from '@/lib/db/models/Bet';
import { getWalletAddressFromRequest, getOrCreateUser } from '@/lib/web3/serverIdentity';
import { getServerPublicClient } from '@/lib/web3/serverClient';
import { winRollAbi } from '@/lib/web3/winRollAbi';
import { WINROLL_CONTRACT_ADDRESS, CHAIN_ID_CELO } from '@/lib/web3/constants';
import { usdtToRaw } from '@/lib/web3/format';
import { validateBet, calculateBet } from '@/lib/services/betCalculator';
import { ON_CHAIN_BET_TYPE, BET_TYPES } from '@/lib/utils/betTypes';
import { getCurrentRoundWindow } from '@/lib/utils/rounds';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MIN_BET_USDT = Number(process.env.NEXT_PUBLIC_MIN_BET_USDT) || 1;
const MAX_BET_USDT = Number(process.env.NEXT_PUBLIC_MAX_BET_USDT) || 1000;

/**
 * Records a bet after the player has staked USDT into WinRollGame from
 * MiniPay.
 *
 * Trust model: the multiplier and winnings are recomputed server-side, and
 * the on-chain transaction is verified against Celo — we confirm a
 * `BetPlaced` event from the contract for this player, round and bet type,
 * with at least the computed stake. Each txHash can back only one bet.
 */
export async function POST(request) {
  try {
    if (!WINROLL_CONTRACT_ADDRESS) {
      return NextResponse.json({ success: false, error: 'WinRollGame contract not configured' }, { status: 500 });
    }

    const headerAddress = getWalletAddressFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const { betType, prediction = [], amount, txHash } = body || {};
    const walletAddress = headerAddress || (body.walletAddress ?? null);

    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'Wallet address required' }, { status: 400 });
    }
    if (!Object.values(BET_TYPES).includes(betType)) {
      return NextResponse.json({ success: false, error: 'Invalid bet type' }, { status: 400 });
    }
    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json({ success: false, error: 'Staking txHash required' }, { status: 400 });
    }

    await connectDB();

    // Idempotency: one bet per staking transaction.
    const existing = await Bet.findOne({ txHash }).lean();
    if (existing) {
      return NextResponse.json({ success: true, bet: { _id: existing._id }, deduped: true });
    }

    const parsedPrediction = Array.isArray(prediction) ? prediction.map(Number) : [];
    const numAmount = Number(amount);

    // Recompute the bet server-side — never trust client-provided winnings.
    const validation = validateBet({
      betType,
      prediction: parsedPrediction,
      amount: numAmount,
      minBetAmount: MIN_BET_USDT,
      maxBetAmount: MAX_BET_USDT,
    });
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const calc = calculateBet({ betType, prediction: parsedPrediction, amount: numAmount });
    const expectedRaw = usdtToRaw(calc.totalCost);
    const expectedBetType = ON_CHAIN_BET_TYPE[betType];

    // Verify the on-chain BetPlaced event.
    const client = getServerPublicClient();
    let receipt;
    try {
      receipt = await client.getTransactionReceipt({ hash: txHash });
    } catch {
      return NextResponse.json({ success: false, error: 'Staking transaction not found on chain' }, { status: 400 });
    }

    if (receipt.status !== 'success') {
      return NextResponse.json({ success: false, error: 'Staking transaction failed' }, { status: 400 });
    }

    const events = parseEventLogs({
      abi: winRollAbi,
      logs: receipt.logs,
      eventName: 'BetPlaced',
    });

    const contract = getAddress(WINROLL_CONTRACT_ADDRESS);
    const player = getAddress(walletAddress);

    const matched = events.find((log) => {
      try {
        return (
          getAddress(log.address) === contract &&
          getAddress(log.args.player) === player &&
          Number(log.args.betType) === expectedBetType &&
          log.args.amount >= expectedRaw
        );
      } catch {
        return false;
      }
    });

    if (!matched) {
      return NextResponse.json({ success: false, error: 'No matching BetPlaced event in transaction' }, { status: 400 });
    }

    // The round id is taken from the on-chain event (source of truth).
    const roundId = matched.args.roundId;
    const currentWindow = getCurrentRoundWindow();
    if (roundId !== currentWindow.roundId || currentWindow.isClosed) {
      return NextResponse.json({ success: false, error: 'Bet placed for a closed round' }, { status: 400 });
    }

    const user = await getOrCreateUser(player);

    const bet = await Bet.create({
      user: user._id,
      roundId,
      betType,
      prediction: parsedPrediction,
      amount: calc.totalCost,
      currency: 'USDT',
      chainId: CHAIN_ID_CELO,
      txHash,
      walletAddress: player.toLowerCase(),
      multiplier: calc.multiplier,
      potentialWinnings: calc.potentialWinnings,
      status: 'pending',
    });

    if (!user.hasPlacedFirstBet) {
      user.hasPlacedFirstBet = true;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      bet: {
        _id: bet._id,
        roundId,
        amount: calc.totalCost,
        multiplier: calc.multiplier,
        potentialWinnings: calc.potentialWinnings,
        status: bet.status,
      },
    });
  } catch (error) {
    console.error('Place bet error:', error);
    return NextResponse.json({ success: false, error: 'Failed to place bet' }, { status: 500 });
  }
}
