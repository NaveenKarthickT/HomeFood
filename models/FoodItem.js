const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: true,
    trim: true
  },
  nameTa: {
    type: String,
    required: true,
    trim: true
  },
  descEn: {
    type: String,
    default: ''
  },
  descTa: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['breakfast', 'meals', 'dinner', 'snacks', 'drinks', 'pickles', 'coconuts', 'oils']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    required: true
  },
  badgeEn: {
    type: String,
    default: ''
  },
  badgeTa: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'spicy'],
    default: 'medium'
  },
  prepTime: {
    type: String,
    default: '15-20 min'
  },
  servingEn: {
    type: String,
    default: 'Serves 1'
  },
  servingTa: {
    type: String,
    default: '1 நபர்'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
