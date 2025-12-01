import { Schema, model, Types } from 'mongoose';

const notificationSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'payment', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model('Notification', notificationSchema);
