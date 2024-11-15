import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expires: Date,
  sessionToken: String,
}, {
  timestamps: true
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session; 