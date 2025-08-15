import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'user1', index: true },
    title: { type: String, required: true },
    bpm: { type: Number },
    key: { type: String },
    lyrics: { type: String },
    streamingLinks: [{ type: String }],
    tags: [{ type: String }]
  },
  { timestamps: true }
);

export const Song = mongoose.model('Song', songSchema);
