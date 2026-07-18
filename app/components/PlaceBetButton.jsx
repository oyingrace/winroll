'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useUsdtWallet } from '@/lib/web3/hooks/useUsdtWallet';
import { walletFetch } from '@/lib/web3/apiClient';
import { usdtToRaw } from '@/lib/web3/format';
import { ON_CHAIN_BET_TYPE, BET_TYPES } from '@/lib/utils/betTypes';

export function PlaceBetButton({ roundId, betType, sum, amount, disabled, onPlaced }) {
  const { address, isConnected } = useApp();
  const { placeBet } = useUsdtWallet();
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState(null);

  const prediction = betType === BET_TYPES.EXACT_SUM ? [sum] : [];

  async function handleClick() {
    setError(null);
    setIsPlacing(true);
    try {
      const amountRaw = usdtToRaw(amount);
      const txHash = await placeBet({
        roundId,
        betType: ON_CHAIN_BET_TYPE[betType],
        numbers: prediction,
        amountRaw,
      });

      const res = await walletFetch(address, '/api/bets/place', {
        method: 'POST',
        body: JSON.stringify({ betType, prediction, amount: Number(amount), txHash }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to record bet');

      onPlaced?.(data.bet);
    } catch (err) {
      console.error('Place bet failed:', err);
      setError(err.shortMessage || err.message || 'Bet failed');
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !isConnected || isPlacing}
        className="w-full rounded-full bg-emerald-500 text-black font-semibold py-3 disabled:opacity-40"
      >
        {isPlacing ? 'Placing bet…' : isConnected ? 'Place Bet' : 'Connect wallet to play'}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}
