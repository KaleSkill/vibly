import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: String,
  provider: {
    type: String,
    required: true
  },
  providerAccountId: {
    type: String,
    required: true
  },
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
}, {
  timestamps: true
});

// Compound index to ensure unique provider accounts
accountSchema.index(
  { provider: 1, providerAccountId: 1 },
  { unique: true }
);

const Account = mongoose.models.Account || mongoose.model('Account', accountSchema);

export default Account; 