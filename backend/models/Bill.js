const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  invoiceNumber: { type: Number },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      sellingPrice: { type: Number, required: true },
      gstPercentage: { type: Number, required: true },
      subtotal: { type: Number, required: true }, // price * qty
    }
  ],
  totalSubtotal: { type: Number, required: true },
  totalGST: { type: Number, required: true },
  finalTotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['Cash', 'UPI', 'Razorpay'] },
  paymentStatus: { type: String, required: true, enum: ['Pending', 'Completed', 'Failed'] },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
