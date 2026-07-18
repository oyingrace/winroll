'use client';

import { useEffect, useState } from 'react';

export function ResultsTicker() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/results?limit=12');
        const data = await res.json();
        if (!cancelled && data?.success) setResults(data.data);
      } catch (err) {
        console.error('Failed to load results:', err);
      }
    }

    load();
    const interval = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!results.length) {
    return <p className="text-center text-zinc-600 text-sm py-4">No rounds revealed yet.</p>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {results.map((r) => (
        <div
          key={r.roundId}
          className="flex-shrink-0 flex flex-col items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2"
        >
          <span className="text-xs text-zinc-500">{r.roundId.slice(-4)}</span>
          <span className="font-mono font-bold">
            {r.die1}+{r.die2}={r.sum}
          </span>
        </div>
      ))}
    </div>
  );
}
