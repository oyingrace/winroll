'use client';

function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RoundStatus({ round, now }) {
  if (!round) {
    return <div className="text-center text-zinc-500 py-6">Loading round…</div>;
  }

  const cutoff = new Date(round.cutoffTime).getTime();
  const reveal = new Date(round.revealTime).getTime();
  const isClosed = now >= cutoff;
  const target = isClosed ? reveal : cutoff;
  const remaining = target - now;

  return (
    <div className="flex flex-col items-center gap-1 py-6">
      <span className="text-xs uppercase tracking-widest text-zinc-500">Round {round.roundId}</span>
      <span className="text-4xl font-mono font-bold tabular-nums">{formatCountdown(remaining)}</span>
      <span className={`text-xs font-medium ${isClosed ? 'text-amber-400' : 'text-emerald-400'}`}>
        {isClosed ? 'Betting closed — rolling soon' : 'Betting open'}
      </span>
    </div>
  );
}
