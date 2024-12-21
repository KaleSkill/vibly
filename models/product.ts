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
    default: () => ({})
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
    default: function (this: mongoose.Document & { price: number }) {
      return this.price;
    }
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    required: [true, 'Gender is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  variants: [variantSchema],
  paymentOptions: {
    cod: { type: Boolean, default: true },
    online: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  saleType: {
    type: Boolean,
    default: false
  },
  salePrice: {
    type: Number,
    min: 0,
    default: 0
  },
  salePriceDiscount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountedSalePrice: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate both regular discounted price and sale discounted price
productSchema.pre('save', function (next) {
  // Calculate regular discounted price
  if (this.isModified('price') || this.isModified('discountPercent')) {
    this.discountedPrice = this.discountPercent > 0
      ? Math.round(this.price - (this.price * (this.discountPercent / 100)))
      : this.price;
  }

  // Calculate sale discounted price
  if (this.isModified('salePrice') || this.isModified('salePriceDiscount')) {
    this.discountedSalePrice = this.salePriceDiscount > 0
      ? Math.round(this.salePrice - (this.salePrice * (this.salePriceDiscount / 100)))
      : this.salePrice;
  }

  // Reset sale fields if saleType is false
  if (this.isModified('saleType') && !this.saleType) {
    this.salePrice = 0;
    this.salePriceDiscount = 0;
    this.discountedSalePrice = 0;
  }

  next();
});

// Add indexes
productSchema.index({ name: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 