import { Schema, model, Types } from 'mongoose';

const reviewSchema = new Schema({
  listingId: { type: Types.ObjectId, ref: 'Listing', required: true },
  guestId: { type: Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

reviewSchema.index({ listingId: 1 });

export default model('Review', reviewSchema);
