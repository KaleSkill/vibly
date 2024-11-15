import mongoose from 'mongoose';

const genderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    enum: ['male', 'female', 'kids', 'unisex'],
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const Gender = mongoose.models.Gender || mongoose.model('Gender', genderSchema);

export default Gender; 