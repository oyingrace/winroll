/** Shape returned by GET /api/rounds/current. */
export interface RoundWindow {
  roundId: string;
  openTime: string;
  cutoffTime: string;
  revealTime: string;
  isClosed: boolean;
  status: 'scheduled' | 'open' | 'closed' | 'revealed';
  commitHash: string | null;
  contractAddress: string | null;
  stakeTokenDecimals: number;
}

/** Shape returned by POST /api/bets/place. */
export interface PlacedBet {
  _id: string;
  roundId: string;
  amount: number;
  multiplier: number;
  potentialWinnings: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
}
