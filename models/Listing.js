import { Schema, model, Types } from 'mongoose';

const listingSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },

  images: [
    {
      url: { type: String, required: true },
      filename: { type: String },
    },
  ],
  coverImage: { type: String }, // 🆕 main display image

  address: {
    line1: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  amenities: [String],
  policies: [String],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default model('Listing', listingSchema);
