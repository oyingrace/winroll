'use client';

import { BET_TYPES, BET_TYPE_LABELS, getMultiplier } from '@/lib/utils/betTypes';

const SUMS = Array.from({ length: 11 }, (_, i) => i + 2);

export function BetTypeSelector({ betType, setBetType, sum, setSum }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.values(BET_TYPES).map((type) => {
          const multiplier = getMultiplier(type, type === BET_TYPES.EXACT_SUM ? [sum] : []);
          return (
            <button
              key={type}
              type="button"
              onClick={() => setBetType(type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                betType === type
                  ? 'bg-emerald-500 text-black border-emerald-500'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {BET_TYPE_LABELS[type]}
              <span className="block text-xs opacity-70">{multiplier?.toFixed(2)}x</span>
            </button>
          );
        })}
      </div>

      {betType === BET_TYPES.EXACT_SUM && (
        <div className="flex flex-wrap gap-2">
          {SUMS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSum(n)}
              className={`w-9 h-9 rounded-full text-sm font-semibold border transition-colors ${
                sum === n
                  ? 'bg-emerald-500 text-black border-emerald-500'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
