// import { Schema, model, Types } from 'mongoose';

// const imageSchema = new Schema({
//   url: { type: String, required: true },
//   publicId: { type: String, required: true },
//   uploadedBy: { type: Types.ObjectId, ref: 'User' },
//   listingId: { type: Types.ObjectId, ref: 'Listing' },
//   roomId: { type: Types.ObjectId, ref: 'Room' },
//   createdAt: { type: Date, default: Date.now },
// });

// export default model('Image', imageSchema);

// models/Image.js
import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default model('Image', imageSchema);

