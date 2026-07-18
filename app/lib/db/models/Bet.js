import mongoose from 'mongoose';

const betSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roundId: {
      type: String,
      required: true,
    },
    betType: {
      type: String,
      enum: ['exact-sum', 'over', 'under', 'lucky-seven', 'double'],
      required: true,
    },
    // Only exact-sum carries a value here: [sum].
    prediction: [
      {
        type: Number,
      },
    ],
    // Stake amount, denominated in USDT.
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['USDT'],
      default: 'USDT',
    },
    // On-chain settlement details (Celo).
    chainId: { type: Number, default: null },
    txHash: { type: String, default: null },
    walletAddress: { type: String, default: null, lowercase: true },
    multiplier: {
      type: Number,
      required: true,
    },
    potentialWinnings: {
      type: Number,
      required: true,
    },
    payout: {
      type: Number,
      default: 0,
    },
    payoutTxHash: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'won', 'lost', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

betSchema.index({ user: 1, status: 1 });
betSchema.index({ roundId: 1, status: 1 });
betSchema.index({ createdAt: -1 });
betSchema.index({ txHash: 1 }, { sparse: true });

const Bet = mongoose.models.Bet || mongoose.model('Bet', betSchema);

export default Bet;
