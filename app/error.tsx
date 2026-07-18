'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-950 text-white px-4 text-center">
      <p className="text-sm text-zinc-400">Something went wrong.</p>
      <p className="text-xs text-zinc-600">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-full bg-emerald-500 text-black text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
