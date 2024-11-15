import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  image: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true
  },
  emailVerified: Date
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 