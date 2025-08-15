import mongoose from 'mongoose';

const setlistSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'user1', index: true },
    name: { type: String, required: true },
    items: [
      {
        songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
        notes: { type: String },
        moodTags: [{ type: String }]
      }
    ]
  },
  { timestamps: true }
);

export const Setlist = mongoose.model('Setlist', setlistSchema);
