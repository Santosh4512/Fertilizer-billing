const express = require('express');
const router = express.Router();
const { createBill, verifyPayment, getBills, getBillById, deleteBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createBill).get(protect, getBills);
router.post('/verify-payment', protect, verifyPayment);
router.route('/:id').get(protect, getBillById).delete(protect, deleteBill);

module.exports = router;
