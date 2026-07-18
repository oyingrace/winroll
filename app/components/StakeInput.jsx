'use client';

export function StakeInput({ amount, setAmount, min = 1, max = 1000, potentialWinnings }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-zinc-500" htmlFor="stake">
        Stake (USDT)
      </label>
      <input
        id="stake"
        type="number"
        min={min}
        max={max}
        step="0.1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-lg font-mono outline-none focus:border-emerald-500"
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>
          Min {min} / Max {max}
        </span>
        <span>Wins {potentialWinnings} USDT</span>
      </div>
    </div>
  );
}
