import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Color',
      required: true
    },
    size: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      required: true
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart; 