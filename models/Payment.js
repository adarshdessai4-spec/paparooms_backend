import { Schema, model, Types } from 'mongoose';

const paymentSchema = new Schema({
  bookingId: { type: Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true }, // in paise
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default model('Payment', paymentSchema);
