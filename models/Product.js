const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  mainPrice: { type: Number, required: true },
  discountedPrice: { type: Number },
  category: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  type: { type: String },
  exchangePossible: { type: String, enum: ['Yes', 'No'], required: true },
  description: { type: String, required: true },
  openToNegotiation: { type: String, enum: ['Yes', 'No', 'Not sure'], required: true },
  quantity: { type: Number, required: true },
  images: [String],
  videos: [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
