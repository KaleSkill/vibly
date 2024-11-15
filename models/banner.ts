import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure unique positions
bannerSchema.pre('save', async function(next) {
  if (this.active) {
    const existingBanner = await mongoose.models.Banner.findOne({
      position: this.position,
      _id: { $ne: this._id }
    });

    if (existingBanner) {
      throw new Error(`Position ${this.position} is already taken`);
    }
  }
  next();
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export default Banner; 