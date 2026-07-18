'use client';

import { BET_TYPE_LABELS } from '@/lib/utils/betTypes';

const STATUS_STYLES = {
  pending: 'text-amber-400',
  won: 'text-emerald-400',
  lost: 'text-zinc-500',
  cancelled: 'text-zinc-600',
};

export function BetHistoryList({ bets, isLoading }) {
  if (isLoading) {
    return <p className="text-center text-zinc-500 text-sm py-6">Loading bets…</p>;
  }

  if (!bets.length) {
    return <p className="text-center text-zinc-500 text-sm py-6">No bets yet — place your first roll.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {bets.map((bet) => (
        <li
          key={bet._id}
          className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm"
        >
          <div className="flex flex-col">
            <span className="font-medium">{BET_TYPE_LABELS[bet.betType] || bet.betType}</span>
            <span className="text-xs text-zinc-500">Round {bet.roundId}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono">{bet.amount} USDT</span>
            <span className={`text-xs font-medium ${STATUS_STYLES[bet.status] || 'text-zinc-500'}`}>
              {bet.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
