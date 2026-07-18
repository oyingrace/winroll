// Dice bet types, on-chain encoding, and payout odds. Two six-sided dice
// (36 equally likely outcomes) drive fixed fair odds with a house edge — no
// per-game DB configuration needed since there's exactly one game.

export const BET_TYPES = {
  EXACT_SUM: 'exact-sum',
  OVER: 'over',
  UNDER: 'under',
  LUCKY_SEVEN: 'lucky-seven',
  DOUBLE: 'double',
};

/** Matches the betType encoding in WinRollGame.sol. */
export const ON_CHAIN_BET_TYPE = {
  [BET_TYPES.EXACT_SUM]: 0,
  [BET_TYPES.OVER]: 1,
  [BET_TYPES.UNDER]: 2,
  [BET_TYPES.LUCKY_SEVEN]: 3,
  [BET_TYPES.DOUBLE]: 4,
};

export const HOUSE_EDGE = 0.05;

// Ways to roll each sum with two six-sided dice (out of 36 total outcomes).
const SUM_WAYS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
const OVER_UNDER_WAYS = 15; // sums 8-12, or sums 2-6
const LUCKY_SEVEN_WAYS = 6;
const DOUBLE_WAYS = 6; // (1,1) (2,2) (3,3) (4,4) (5,5) (6,6)

function fairMultiplier(waysOutOf36) {
  return Number(((36 / waysOutOf36) * (1 - HOUSE_EDGE)).toFixed(4));
}

/** Prediction payload validation, mirrors the contract's `_validateBet`. */
export function validatePrediction(betType, prediction) {
  const numbers = Array.isArray(prediction) ? prediction : [];
  if (betType === BET_TYPES.EXACT_SUM) {
    return numbers.length === 1 && Number.isInteger(numbers[0]) && numbers[0] >= 2 && numbers[0] <= 12;
  }
  if ([BET_TYPES.OVER, BET_TYPES.UNDER, BET_TYPES.LUCKY_SEVEN, BET_TYPES.DOUBLE].includes(betType)) {
    return numbers.length === 0;
  }
  return false;
}

/** Payout multiplier for a bet type (and, for exact-sum, its predicted sum). */
export function getMultiplier(betType, prediction = []) {
  switch (betType) {
    case BET_TYPES.EXACT_SUM: {
      const ways = SUM_WAYS[prediction[0]];
      return ways ? fairMultiplier(ways) : null;
    }
    case BET_TYPES.OVER:
    case BET_TYPES.UNDER:
      return fairMultiplier(OVER_UNDER_WAYS);
    case BET_TYPES.LUCKY_SEVEN:
      return fairMultiplier(LUCKY_SEVEN_WAYS);
    case BET_TYPES.DOUBLE:
      return fairMultiplier(DOUBLE_WAYS);
    default:
      return null;
  }
}

/** Whether a bet wins, given the revealed dice. */
export function evaluateOutcome(betType, prediction, die1, die2) {
  const sum = die1 + die2;
  switch (betType) {
    case BET_TYPES.EXACT_SUM:
      return prediction[0] === sum;
    case BET_TYPES.OVER:
      return sum > 7;
    case BET_TYPES.UNDER:
      return sum < 7;
    case BET_TYPES.LUCKY_SEVEN:
      return sum === 7;
    case BET_TYPES.DOUBLE:
      return die1 === die2;
    default:
      return false;
  }
}

export const BET_TYPE_LABELS = {
  [BET_TYPES.EXACT_SUM]: 'Exact sum',
  [BET_TYPES.OVER]: 'Over 7',
  [BET_TYPES.UNDER]: 'Under 7',
  [BET_TYPES.LUCKY_SEVEN]: 'Lucky seven',
  [BET_TYPES.DOUBLE]: 'Double',
};

const betTypesApi = {
  BET_TYPES,
  ON_CHAIN_BET_TYPE,
  BET_TYPE_LABELS,
  HOUSE_EDGE,
  validatePrediction,
  getMultiplier,
  evaluateOutcome,
};

export default betTypesApi;
