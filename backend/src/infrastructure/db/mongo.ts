/* eslint-disable no-undef */
import mongoose from 'mongoose';

export async function connectMongo(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    if (error instanceof Error) {
      console.error('MongoDB connection error:', error.message);
    } else {
      console.error('MongoDB connection error:', error);
    }
    process.exit(1);
  }
}
