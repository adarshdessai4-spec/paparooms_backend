import razorpay from '../middlewares/razorpayService.js';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';
import crypto from 'crypto';

// ✅ Create Razorpay Order securely
export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payments are temporarily unavailable. Please try again later.',
      });
    }
    const { bookingId } = req.body;
    const userId = req.user.id.toString();

    const booking = await Booking.findById(bookingId).populate('roomId');
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found' });
    console.log('Booking guestId:', booking.guestId.toString());
    console.log('current logged in userId:', userId);
    console.log('decode userId from token:', req.user);
    if (booking.guestId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pay for this booking',
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid',
      });
    }

    // ✅ Recalculate total amount (to prevent frontend tampering)
    const nights = Math.ceil(
      (new Date(booking.checkOut) - new Date(booking.checkIn)) /
        (1000 * 60 * 60 * 24)
    );
    const totalAmount = nights * booking.roomId.pricePerNight;
    const amountPaise = Math.round(totalAmount * 100);

    // ✅ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: bookingId,
      notes: { bookingId, userId },
    });

    // ✅ Save payment record
    await Payment.create({
      bookingId,
      userId,
      razorpayOrderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      status: 'created',
    });

    return res.json({
      success: true,
      orderId: order.id,
      bookingId,
      amount: totalAmount,
      currency: 'INR',
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// ✅ Verify Razorpay Payment Signature
export const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payments are temporarily unavailable. Please try again later.',
      });
    }
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      },
      { new: true }
    );

    // ✅ Update booking status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    return res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      payment,
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};
