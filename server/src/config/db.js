import mongoose from 'mongoose';

export let isDbConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/silverhands';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    isDbConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}). Operating in demo in-memory mode for Phase 1 authentication.`);
  }
};

export default connectDB;

