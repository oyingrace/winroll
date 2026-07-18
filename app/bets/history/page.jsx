'use client';

import { WalletBar } from '@/components/WalletBar';
import { BetHistoryList } from '@/components/BetHistoryList';
import { useBetHistory } from '@/lib/web3/hooks/useBetHistory';

export default function BetHistoryPage() {
  const { bets, isLoading } = useBetHistory();

  return (
    <div className="flex flex-col flex-1 bg-zinc-950 text-white">
      <WalletBar />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-4">
        <h1 className="text-lg font-semibold">My bets</h1>
        <BetHistoryList bets={bets} isLoading={isLoading} />
      </main>
    </div>
  );
}
