import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'user1', index: true },
    name: { type: String, required: true },
    address: { type: String },
    contacts: [{ type: String }],
    stageDimensions: { type: String },
    stageWidth: { type: Number },
    stageHeight: { type: Number },
    electrical: { type: String },
    lighting: { type: String },
    audio: { type: String },
    hours: { type: String }
  },
  { timestamps: true }
);

export const Venue = mongoose.model('Venue', venueSchema);
