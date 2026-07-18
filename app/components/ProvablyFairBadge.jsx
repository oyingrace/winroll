import Link from 'next/link';

export function ProvablyFairBadge() {
  return (
    <Link
      href="/how-it-works"
      className="inline-flex items-center gap-1 self-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
    >
      🔒 Provably fair — how rolls are verified
    </Link>
  );
}
