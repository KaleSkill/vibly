import mongoose from 'mongoose';

const saleProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
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
    default: function(this: any) {
      return this.salePrice;
    }
  }
});

const saleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  products: [saleProductSchema],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  }
}, {
  timestamps: true
});

// Pre-save hook to update product prices
saleSchema.pre('save', async function(next) {
  try {
    const Product = mongoose.model('Product');
    
    // Update each product's sale status and prices
    for (const item of this.products) {
      if (this.status === 'active') {
        await Product.findByIdAndUpdate(item.product, {
          saleType: true,
          salePrice: item.salePrice,
          salePriceDiscount: item.salePriceDiscount,
          discountedSalePrice: item.discountedSalePrice
        });
      } else {
        await Product.findByIdAndUpdate(item.product, {
          saleType: false,
          salePrice: 0,
          salePriceDiscount: 0,
          discountedSalePrice: 0
        });
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);

export default Sale; 