import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    handle: { type: String },
    preferences: { type: Object, default: {} }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
