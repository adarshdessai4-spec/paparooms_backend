import { Schema, model, Types } from 'mongoose';

const availabilitySchema = new Schema({
  roomId: { type: Types.ObjectId, ref: 'Room', required: true },
  date: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
  priceOverride: { type: Number },
  blockedReason: { type: String }, // maintenance, owner block, etc.
});

availabilitySchema.index({ roomId: 1, date: 1 }, { unique: true });

export default model('Availability', availabilitySchema);
