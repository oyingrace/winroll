// Fixed-interval round scheduling (UTC). A round opens on a clean interval
// boundary, accepts bets until BETTING_CUTOFF_SECONDS before it ends, and is
// revealed at the end of the interval.

export const ROUND_INTERVAL_MINUTES = Number(process.env.NEXT_PUBLIC_ROUND_INTERVAL_MINUTES) || 60;
export const BETTING_CUTOFF_SECONDS = Number(process.env.NEXT_PUBLIC_BETTING_CUTOFF_SECONDS) || 60;

function floorToInterval(date, intervalMinutes) {
  const ms = intervalMinutes * 60 * 1000;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

/** roundId format: YYYYMMDD-HHmm (UTC), taken from the round's open time. */
export function formatRoundId(date) {
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}${mo}${d}-${h}${mi}`;
}

export function parseRoundId(roundId) {
  const match = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/.exec(roundId);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)));
}

/** The round window containing `date` — the one currently open or about to open. */
export function getCurrentRoundWindow(date = new Date()) {
  const openTime = floorToInterval(date, ROUND_INTERVAL_MINUTES);
  const revealTime = new Date(openTime.getTime() + ROUND_INTERVAL_MINUTES * 60 * 1000);
  const cutoffTime = new Date(revealTime.getTime() - BETTING_CUTOFF_SECONDS * 1000);
  return {
    roundId: formatRoundId(openTime),
    openTime,
    cutoffTime,
    revealTime,
    isClosed: date >= cutoffTime,
  };
}

/** The round window immediately after `date`'s current one — used once betting has closed. */
export function getNextRoundWindow(date = new Date()) {
  const current = getCurrentRoundWindow(date);
  return getCurrentRoundWindow(new Date(current.revealTime.getTime() + 1));
}

const roundsApi = {
  ROUND_INTERVAL_MINUTES,
  BETTING_CUTOFF_SECONDS,
  formatRoundId,
  parseRoundId,
  getCurrentRoundWindow,
  getNextRoundWindow,
};

export default roundsApi;
