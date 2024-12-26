import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  images: [{
    public_id:String,
    secure_url:String
  }],
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export default Banner; 