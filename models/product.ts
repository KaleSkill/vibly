import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  }
});

const variantSchema = new mongoose.Schema({
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true
  },
  colorName: String,
  images: [String],
  sizes: [sizeSchema]
});

const specificationSchema = new mongoose.Schema({
  material: { type: String, default: '' },
  fit: { type: String, default: '' },
  occasion: { type: String, default: '' },
  pattern: { type: String, default: '' },
  washCare: { type: String, default: '' },
  style: { type: String, default: '' },
  neckType: { type: String, default: '' },
  sleeveType: { type: String, default: '' },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  specifications: {
    type: specificationSchema,
    required: false,
    default: () => ({})  // This makes it optional with empty defaults
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  discountPercent: { 
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountedPrice: { 
    type: Number,
    min: 0,
    default: function(this: any) {
      return this.price;
    }
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'kids', 'unisex'],
    required: [true, 'Gender is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  variants: [variantSchema],
  featured: {
    type: Boolean,
    default: false
  },
  paymentOptions: {
    cod: { type: Boolean, default: true },
    online: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: [ 'active', 'inactive'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// Calculate discountedPrice before saving
productSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discountPercent')) {
    this.discountedPrice = this.discountPercent > 0 
      ? Math.round(this.price - (this.price * (this.discountPercent / 100)))
      : this.price;
  }
  next();
});

// Add these indexes to your existing schema
productSchema.index({ name: 'text' });  // For text search
productSchema.index({ price: 1 });      // For price sorting
productSchema.index({ category: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 