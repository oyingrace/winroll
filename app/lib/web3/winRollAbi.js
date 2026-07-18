/** WinRollGame ABI — the subset the app needs (bet placement, round reads, events). */
export const winRollAbi = [
  {
    type: 'function',
    name: 'placeBet',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'roundId', type: 'string' },
      { name: 'betType', type: 'uint8' },
      { name: 'numbers', type: 'uint8[]' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'minBet',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'maxBet',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getRound',
    stateMutability: 'view',
    inputs: [{ name: 'roundId', type: 'string' }],
    outputs: [
      { name: 'die1', type: 'uint8' },
      { name: 'die2', type: 'uint8' },
      { name: 'committed', type: 'bool' },
      { name: 'revealed', type: 'bool' },
      { name: 'revealedAt', type: 'uint64' },
    ],
  },
  {
    type: 'event',
    name: 'BetPlaced',
    inputs: [
      { indexed: true, name: 'ticketId', type: 'uint256' },
      { indexed: true, name: 'player', type: 'address' },
      { indexed: true, name: 'roundIdHash', type: 'bytes32' },
      { indexed: false, name: 'betType', type: 'uint8' },
      { indexed: false, name: 'numbers', type: 'uint8[]' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'roundId', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'RoundRevealed',
    inputs: [
      { indexed: true, name: 'roundIdHash', type: 'bytes32' },
      { indexed: false, name: 'die1', type: 'uint8' },
      { indexed: false, name: 'die2', type: 'uint8' },
      { indexed: false, name: 'roundId', type: 'string' },
      { indexed: false, name: 'seed', type: 'bytes32' },
      { indexed: false, name: 'revealedAt', type: 'uint64' },
    ],
  },
];
