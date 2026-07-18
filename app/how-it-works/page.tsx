export const metadata = {
  title: 'How it works — WinRoll',
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-950 text-white">
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-10 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">How WinRoll stays fair</h1>

        <ol className="flex flex-col gap-4 text-sm text-zinc-300 list-decimal list-inside">
          <li>
            Every round, the operator generates a random seed off-chain and publishes only its{' '}
            <code className="text-emerald-400">keccak256</code> hash on-chain via{' '}
            <code className="text-emerald-400">commitRound</code>. Nobody — including the operator —
            can predict the roll from the hash alone.
          </li>
          <li>Bets are placed on-chain during the open betting window, before the seed is ever revealed.</li>
          <li>
            After betting closes, the operator submits the seed via{' '}
            <code className="text-emerald-400">revealRound</code>. The contract checks it hashes to the
            earlier commitment, then derives <code className="text-emerald-400">die1</code> and{' '}
            <code className="text-emerald-400">die2</code> deterministically from the seed.
          </li>
          <li>
            Anyone can recompute the hash and the roll from the revealed seed to verify the round wasn&apos;t
            rigged after bets were placed.
          </li>
        </ol>

        <p className="text-xs text-zinc-500">
          This is the same commit-reveal pattern used to keep any operator-run randomness source honest:
          commit before you know the bets, reveal after betting closes.
        </p>
      </main>
    </div>
  );
}
