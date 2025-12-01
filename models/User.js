import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

const userSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: { 
    type: String, 
    trim: true 
  },
    password: { 
    type: String, 
    minlength: 8, 
    select: false,
    // Password NOT required for Google-only users
    required: function() {
      return this.authProvider === 'local' || this.authProvider === 'both';
    }
  },
  
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allows null but unique when present
    unique: true,
  },
  profilePicture: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'both'],
    default: 'local'
  },
  
  // Reset password section
  resetPassword: {
    otp: { type: String },
    expiresAt: { type: Date },
  },
  
  role: { 
    type: String, 
    enum: ['guest', 'owner', 'admin'], 
    default: 'guest' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date 
  },
  
  // Owner profile section
  ownerProfile: {
    emailVerified: { 
      type: Boolean, 
      default: false 
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date }
    },
   kyc: {
      // 👇 KYC relationship
      status: {
        type: String,
        enum: ['resubmitted', 'pending', 'approved', 'rejected','not_submitted'],
        default: 'not_submitted',
      },
      kycRef: { type: Schema.Types.ObjectId, ref: 'Kyc' },
      rejectionReason: { type: String, default: null },
      lastSubmittedAt: { type: Date },
    },
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Hash password before saving (only for local auth users)
userSchema.pre('save', async function (next) {
  // Skip if:
  // 1. Password hasn't been modified
  // 2. No password exists (Google-only users)
  // 3. User is being created with Google auth only
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method (only works for users with passwords)
userSchema.methods.comparePassword = async function (candidate) {
  // If no password exists (Google-only user), return false
  if (!this.password) {
    return false;
  }
  
  try {
    return await compare(candidate, this.password);
  } catch (error) {
    return false;
  }
};

// Method to check if user can login with password
userSchema.methods.hasPassword = function() {
  return this.authProvider === 'local' || this.authProvider === 'both';
};

// Method to check if user can login with Google
userSchema.methods.hasGoogleAuth = function() {
  return this.authProvider === 'google' || this.authProvider === 'both';
};

// Virtual for full name (if you want to split name later)
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });

// Transform output (remove sensitive data)
userSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default model('User', userSchema);
