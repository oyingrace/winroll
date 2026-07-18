import { validatePrediction, getMultiplier } from '@/lib/utils/betTypes';

/**
 * Server-side bet validation + payout calculation. Never trust
 * client-provided winnings — this is the single source of truth used both
 * when a bet is placed and (by winroll-cron) when it's settled.
 */
export function validateBet({ betType, prediction, amount, minBetAmount, maxBetAmount }) {
  if (!validatePrediction(betType, prediction)) {
    return { valid: false, error: 'Invalid prediction for this bet type' };
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Invalid stake amount' };
  }
  if (numAmount < minBetAmount || numAmount > maxBetAmount) {
    return { valid: false, error: `Stake must be between ${minBetAmount} and ${maxBetAmount} USDT` };
  }
  return { valid: true };
}

export function calculateBet({ betType, prediction, amount }) {
  const multiplier = getMultiplier(betType, prediction);
  const numAmount = Number(amount);
  return {
    multiplier,
    totalCost: numAmount,
    potentialWinnings: Number((numAmount * multiplier).toFixed(6)),
  };
}

const betCalculator = { validateBet, calculateBet };

export default betCalculator;
