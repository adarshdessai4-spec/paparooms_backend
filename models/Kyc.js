import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Document URLs
  profilePhoto: { type: String, required: true },
  aadharCard: { type: String, required: true },
  panCard: { type: String, required: true },

  // Bank details (flattened)
  bankName: { type: String, required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  accountType: { type: String, enum: ['savings', 'current'], required: true },
  branch: { type: String, required: true },

  // KYC status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resubmitted'],
    default: 'pending',
  },

  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Kyc', kycSchema);
