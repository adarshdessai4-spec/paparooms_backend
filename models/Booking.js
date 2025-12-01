import { Schema, model, Types } from 'mongoose';

const bookingSchema = new Schema({
  roomId: { type: Types.ObjectId, ref: 'Room', required: true },
  listingId: { type: Types.ObjectId, ref: 'Listing', required: true },
  guestId: { type: Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });

export default model('Booking', bookingSchema);
