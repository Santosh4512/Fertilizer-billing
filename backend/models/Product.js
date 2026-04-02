const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  stockQuantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: 'kg' }, // kg, liter, bag, etc.
  buyingPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  gstPercentage: { type: Number, required: true, default: 0 },
  sku: { type: String, unique: true },
  lowStockThreshold: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
