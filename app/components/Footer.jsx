import Link from 'next/link';

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 py-4 text-xs text-zinc-600 border-t border-white/10">
      <span>WinRoll — dice predictions on Celo</span>
      <Link href="/how-it-works" className="text-zinc-400 hover:text-zinc-200">
        How it works
      </Link>
      <Link href="/bets/history" className="text-zinc-400 hover:text-zinc-200">
        My bets
      </Link>
    </footer>
  );
}
