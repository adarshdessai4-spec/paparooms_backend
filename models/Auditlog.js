import { Schema, model, Types } from 'mongoose';

const auditLogSchema = new Schema({
  actorId: { type: Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target: { type: String }, // e.g., 'Listing:123'
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export default model('AuditLog', auditLogSchema);
