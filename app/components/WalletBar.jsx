'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { useUsdtBalance } from '@/lib/web3/hooks/useUsdtBalance';
import { formatUsdt } from '@/lib/web3/format';

export function WalletBar() {
  const { isMiniPay, address, isConnected, isConnecting, connectWallet } = useApp();
  const { data: balance } = useUsdtBalance(address);

  return (
    <header className="flex items-center justify-between w-full px-4 py-3 border-b border-white/10">
      <Link href="/" className="font-semibold tracking-tight text-lg">
        🎲 WinRoll
      </Link>
      {isConnected ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-400">{formatUsdt(balance)} USDT</span>
          <span className="px-2 py-1 rounded-full bg-white/10 font-mono">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </div>
      ) : isMiniPay ? (
        <span className="text-sm text-zinc-400">Connecting…</span>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 rounded-full bg-emerald-500 text-black text-sm font-medium disabled:opacity-50"
        >
          {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
      )}
    </header>
  );
}
