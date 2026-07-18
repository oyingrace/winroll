import mongoose from 'mongoose';

/**
 * User identity in winroll is the player's Celo wallet address, provided by
 * MiniPay. There is no separate sign-up step — MiniPay is the wallet and the
 * identity provider.
 */
const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: [true, 'Please provide a wallet address'],
      trim: true,
      lowercase: true,
    },
    hasPlacedFirstBet: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ walletAddress: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
