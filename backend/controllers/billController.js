const Bill = require('../models/Bill');
const Product = require('../models/Product');
const razorpayInstance = require('../utils/razorpay');
const crypto = require('crypto');

// @desc    Create new bill / initialize payment
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res) => {
  try {
    const { customerName, customerPhone, products, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in bill' });
    }

    let totalSubtotal = 0;
    let totalGST = 0;
    const processedProducts = [];

    // Verify stock and calculate totals server-side
    for (let item of products) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) return res.status(404).json({ message: `Product not found` });
      
      if (dbProduct.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${dbProduct.name}` });
      }

      const itemFinalTotal = dbProduct.sellingPrice * item.quantity;
      const itemTaxableValue = itemFinalTotal / (1 + (dbProduct.gstPercentage / 100));
      const itemGSTAmount = itemFinalTotal - itemTaxableValue;

      totalSubtotal += itemTaxableValue;
      totalGST += itemGSTAmount;

      processedProducts.push({
        product: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        sellingPrice: dbProduct.sellingPrice,
        gstPercentage: dbProduct.gstPercentage,
        subtotal: itemTaxableValue
      });
    }

    const finalTotal = totalSubtotal + totalGST;

    let paymentStatus = 'Pending';
    let razorpayOrderId = null;

    if (paymentMethod === 'Cash' || paymentMethod === 'UPI') {
      paymentStatus = 'Completed';
    } else if (paymentMethod === 'Razorpay') {
      const options = {
        amount: Math.round(finalTotal * 100), // amount in smallest currency unit
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpayInstance.orders.create(options);
      razorpayOrderId = order.id;
    }

    // Calculate sequential invoice number
    const lastBill = await Bill.findOne().sort({ invoiceNumber: -1 });
    const currentSequence = (lastBill && lastBill.invoiceNumber) ? lastBill.invoiceNumber + 1 : 1001;

    const bill = new Bill({
      invoiceNumber: currentSequence,
      customerName,
      customerPhone,
      products: processedProducts,
      totalSubtotal,
      totalGST,
      finalTotal,
      paymentMethod,
      paymentStatus,
      razorpayOrderId
    });

    const savedBill = await bill.save();

    // Deduct stock if payment is already complete (Cash/UPI)
    if (paymentStatus === 'Completed') {
      for (let item of processedProducts) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity }
        });
      }
    }

    res.status(201).json({
      bill: savedBill,
      razorpayOrderId: razorpayOrderId,
      amount: Math.round(finalTotal * 100),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/bills/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const bill = await Bill.findById(billId);
      if (!bill) return res.status(404).json({ message: 'Bill not found' });

      bill.paymentStatus = 'Completed';
      bill.razorpayPaymentId = razorpay_payment_id;
      await bill.save();

      // Deduct stock
      for (let item of bill.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity }
        });
      }

      res.status(200).json({ message: "Payment verified successfully", bill });
    } else {
      res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({}).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bill by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a bill
// @route   DELETE /api/bills/:id
// @access  Private
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Restore stock quantities
    if (bill.paymentStatus === 'Completed') {
      for (let item of bill.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity }
        });
      }
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill removed and stock restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBill, verifyPayment, getBills, getBillById, deleteBill };
