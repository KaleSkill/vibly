import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true 
  },
  role: { 
    type: String, 
    default: 'user',
    enum: ['user', 'admin'] 
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive']
  }
}, { 
  timestamps: true 
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 