import { Schema, model, Types } from 'mongoose';

const roomSchema = new Schema({
  listingId: { type: Types.ObjectId, ref: 'Listing', required: true },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['single', 'double', 'suite'], required: true },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, default: 2 },
  bedInfo: { type: String },
  amenities: [{ type: String }],
  images: [
    {
      url: { type: String, required: true },
      filename: { type: String, required: true },
    },
  ],
  cancellationPolicy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model('Room', roomSchema);
