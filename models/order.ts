import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      size: String,
      color: String
    },
    quantity: Number,
    price: Number
  }],
  shippingAddress: {
    fullName: String,
    phoneNumber: String,
    streetAddress: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  total: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 