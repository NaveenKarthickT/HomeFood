const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem'
  },
  nameEn: { type: String, required: true },
  nameTa: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  landmark: {
    type: String,
    default: ''
  },
  villageOrCity: {
    type: String,
    enum: ['village', 'city'],
    default: 'village'
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'upi_qr'],
    default: 'cash_on_delivery'
  },
  status: {
    type: String,
    enum: ['Received', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled'],
    default: 'Received'
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
