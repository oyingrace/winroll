# Changelog

## Unreleased — initial build

- `WinRollGame.sol`: commit-reveal dice escrow contract (Foundry, tests, deploy script).
- Mongo models for users, rounds, and bets.
- wagmi/viem + MiniPay wallet integration (`useMiniPay`, `useUsdtBalance`, `useUsdtWallet`).
- Fixed-interval round scheduling and a fixed-odds payout engine for the five bet types (exact sum, over, under, lucky seven, double).
- API routes: current/round detail, results, bet placement with on-chain event verification, user bet history, wallet sync, health check.
- Home page: wallet bar, round countdown, bet type + stake selection, place-bet flow, recent results, provably-fair explainer, bet history page.
