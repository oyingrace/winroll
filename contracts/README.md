# winroll contracts

`WinRollGame.sol` — Foundry project for the USDT dice-prediction escrow contract on Celo.

## How it works

Stakes are escrowed on-chain; the roll for each round is produced with a
commit-reveal scheme so the operator can't choose an outcome after seeing
where the bets landed:

1. `commitRound(roundId, keccak256(seed))` — opens the round by publishing
   only the *hash* of a seed the operator generated off-chain.
2. Players `placeBet(roundId, betType, numbers, amount)` during the betting
   window (stakes escrowed in USDT).
3. `revealRound(roundId, seed)` — after betting closes, the operator submits
   the seed. The contract checks it hashes to the earlier commitment, then
   derives `die1`/`die2` on-chain from `keccak256(seed, roundIdHash)`.
   Anyone can replay this to verify the roll wasn't rigged after the fact.

Winners are paid off-chain by the operator (see the `winroll-cron` service),
funded from escrowed stakes via `withdrawToken` — same payout model as
`cbet`/`CbetLotto`.

## Setup

```bash
npm install                # installs @openzeppelin/contracts (remapped via node_modules)
git submodule update --init --recursive   # forge-std
forge build
```

## Deploy

```bash
DEPLOYER_PRIVATE_KEY=0x... \
STAKE_TOKEN_ADDRESS=0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e \
forge script script/Deploy.s.sol --rpc-url celo --broadcast --verify
```

## Bet type encoding

| value | type         | `numbers`      | payout condition |
|-------|--------------|----------------|-------------------|
| 0     | exact-sum    | `[sum]` (2-12) | `die1 + die2 == sum` |
| 1     | over         | `[]`           | `die1 + die2 > 7` |
| 2     | under        | `[]`           | `die1 + die2 < 7` |
| 3     | lucky-seven  | `[]`           | `die1 + die2 == 7` |
| 4     | double       | `[]`           | `die1 == die2` |
