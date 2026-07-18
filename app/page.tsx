'use client';

import { useState } from 'react';
import { WalletBar } from '@/components/WalletBar';
import { RoundStatus } from '@/components/RoundStatus';
import { BetTypeSelector } from '@/components/BetTypeSelector';
import { StakeInput } from '@/components/StakeInput';
import { PlaceBetButton } from '@/components/PlaceBetButton';
import { ResultsTicker } from '@/components/ResultsTicker';
import { ProvablyFairBadge } from '@/components/ProvablyFairBadge';
import { Footer } from '@/components/Footer';
import { useRound } from '@/lib/web3/hooks/useRound';
import { BET_TYPES, getMultiplier } from '@/lib/utils/betTypes';
import type { RoundWindow, PlacedBet } from '@/lib/types';

const MIN_BET_USDT = Number(process.env.NEXT_PUBLIC_MIN_BET_USDT) || 1;
const MAX_BET_USDT = Number(process.env.NEXT_PUBLIC_MAX_BET_USDT) || 1000;

export default function Home() {
  const { round, now } = useRound() as { round: RoundWindow | null; now: number };
  const [betType, setBetType] = useState(BET_TYPES.OVER);
  const [sum, setSum] = useState(7);
  const [amount, setAmount] = useState(String(MIN_BET_USDT));
  const [lastBet, setLastBet] = useState<PlacedBet | null>(null);

  const multiplier = getMultiplier(betType, betType === BET_TYPES.EXACT_SUM ? [sum] : []);
  const potentialWinnings = multiplier ? (Number(amount) * multiplier).toFixed(2) : '0.00';
  const isClosed = round?.isClosed ?? true;

  return (
    <div className="flex flex-col flex-1 text-white">
      <WalletBar />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
        <RoundStatus round={round} now={now} />

        <BetTypeSelector betType={betType} setBetType={setBetType} sum={sum} setSum={setSum} />

        <StakeInput
          amount={amount}
          setAmount={setAmount}
          min={MIN_BET_USDT}
          max={MAX_BET_USDT}
          potentialWinnings={potentialWinnings}
        />

        <PlaceBetButton
          roundId={round?.roundId}
          betType={betType}
          sum={sum}
          amount={amount}
          disabled={isClosed || !round?.roundId}
          onPlaced={setLastBet}
        />

        {lastBet && (
          <p className="text-center text-xs text-emerald-400">
            Bet placed for round {lastBet.roundId} — potential winnings {lastBet.potentialWinnings} USDT
          </p>
        )}

        <ProvablyFairBadge />

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-zinc-500">Recent rolls</span>
          <ResultsTicker />
        </div>
      </main>
      <Footer />
    </div>
  );
}
