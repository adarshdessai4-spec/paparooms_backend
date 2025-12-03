import { connect } from 'mongoose';

const connectDB = async () => {
  const baseUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oyo_plus';
  // Force retryWrites off for standalone/local to avoid txnNumber errors
  const uri = baseUri.includes('retryWrites=')
    ? baseUri
    : `${baseUri}${baseUri.includes('?') ? '&' : '?'}retryWrites=false&directConnection=true`;

  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI not set; falling back to local MongoDB at mongodb://127.0.0.1:27017/oyo_plus');
  }

  try {
    await connect(uri, {
      retryWrites: false,
    });
    console.log(`MongoDB connected successfully (${uri})`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
