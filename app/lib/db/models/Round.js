import mongoose from 'mongoose';

/**
 * A single dice round. Lifecycle:
 *   scheduled -> open (commitRound tx landed) -> closed (past betting cutoff)
 *   -> revealed (revealRound tx landed, die1/die2 set, bets can be settled)
 */
const roundSchema = new mongoose.Schema(
  {
    roundId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'open', 'closed', 'revealed'],
      default: 'scheduled',
    },
    openTime: { type: Date, required: true },
    cutoffTime: { type: Date, required: true },
    revealTime: { type: Date, required: true },

    // Commit step
    seed: { type: String, default: null }, // hex bytes32, kept secret by the cron until reveal
    commitHash: { type: String, default: null }, // keccak256(seed), published on commitRound
    commitTxHash: { type: String, default: null },
    committedAt: { type: Date, default: null },

    // Reveal step
    die1: { type: Number, default: null, min: 1, max: 6 },
    die2: { type: Number, default: null, min: 1, max: 6 },
    sum: { type: Number, default: null, min: 2, max: 12 },
    isDouble: { type: Boolean, default: null },
    revealTxHash: { type: String, default: null },
    revealedAt: { type: Date, default: null },

    settledAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

roundSchema.index({ roundId: 1 }, { unique: true });
roundSchema.index({ status: 1, openTime: -1 });
roundSchema.index({ revealedAt: -1 });

const Round = mongoose.models.Round || mongoose.model('Round', roundSchema);

export default Round;
