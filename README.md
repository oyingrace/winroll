# winroll

winroll is an on-chain dice-prediction game built as a [MiniPay](https://www.opera.com/products/minipay) Mini App on the [Celo](https://celo.org) blockchain. Players predict the outcome of a two-dice roll, stake **USDT**, and are paid out automatically when the round is revealed — all settled on-chain.

## Features

- **MiniPay-native wallet** — runs inside MiniPay and uses the player's wallet automatically; a Connect Wallet fallback is available in a normal browser.
- **On-chain stakes** — bets are staked into the `WinRollGame` contract in USDT.
- **Provably fair rolls** — every round is committed (hash published) before betting opens and revealed (seed published) after betting closes, so no one — including the operator — can choose a roll after seeing the bets. See [`/how-it-works`](./app/how-it-works).
- **Five bet types** — exact sum, over 7, under 7, lucky seven, and double, each with fixed odds derived from real two-dice probabilities.
- **Rolling rounds** — a new round every 30 minutes by default.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [wagmi](https://wagmi.sh) + [viem](https://viem.sh) (Celo)
- [MongoDB](https://www.mongodb.com) + [Mongoose](https://mongoosejs.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Foundry](https://getfoundry.sh) (contracts)

## Getting started

### Prerequisites

- Node.js 20.9+
- A MongoDB database
- A deployed `WinRollGame` contract (see [`contracts/`](./contracts))

### Setup

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Open the app inside MiniPay (or MiniPay's Site Tester) to use the wallet flow. In a normal desktop browser the app loads with a Connect Wallet button.

## How it works

winroll runs inside the MiniPay dapp browser, which injects an EIP-1193 provider at `window.ethereum` (`isMiniPay === true`). On load the app auto-connects that wallet and identifies the player by their Celo address — there is no sign-up step.

Rounds run on a fixed 30-minute interval (`app/lib/utils/rounds.js`) — the cron publishes results for a round every 30 minutes. Each round is opened on-chain by the `winroll-cron` service via a commit-reveal scheme: it publishes only the hash of a random seed when the round opens, and the actual seed (which the contract uses to derive the roll) only after betting closes. See [`app/how-it-works/page.tsx`](./app/how-it-works/page.tsx) for the full explanation, and [`contracts/README.md`](./contracts/README.md) for the on-chain mechanics.

To place a bet, the player calls `placeBet` on `WinRollGame` (approve + placeBet), signing with their MiniPay wallet. The server verifies the on-chain `BetPlaced` event before recording the bet, so winnings can never be forged from the client (`app/api/bets/place/route.js`).

## Configuration

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `NEXT_PUBLIC_WINROLL_CONTRACT_ADDRESS` | Deployed `WinRollGame` address |
| `NEXT_PUBLIC_USDT_ADDRESS` | USDT token address on Celo (defaults to native USD₮) |
| `CELO_RPC_URL` | Optional custom RPC for server-side verification |
| `NEXT_PUBLIC_ROUND_INTERVAL_MINUTES` | Round length in minutes (default `30`) |
| `NEXT_PUBLIC_BETTING_CUTOFF_SECONDS` | Seconds before reveal when betting closes (default `60`) |
| `NEXT_PUBLIC_MIN_BET_USDT` / `NEXT_PUBLIC_MAX_BET_USDT` | Stake limits (default `1` / `1000`) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## Project structure

```
app/
  api/            # route handlers (rounds, bets, results, auth, health)
  components/     # UI components
  bets/history/    # player's bet history page
  how-it-works/    # provably-fair explainer page
  lib/
    db/           # Mongoose connection + models
    web3/         # MiniPay/wagmi config, hooks, contract ABI, helpers
    services/     # bet calculation
    utils/        # bet types/odds, round scheduling
contracts/        # WinRollGame Solidity contract, tests + deploy script
```

## Related projects

- [`winroll-cron`](https://github.com/oyingrace/winroll-cron) — the scheduler service that commits/reveals rounds on-chain and settles bets.
