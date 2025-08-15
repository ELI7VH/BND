import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'user1', index: true },
    name: { type: String, required: true },
    date: { type: Date },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    setlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Setlist' },
    setlistIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Setlist' }],
    arriveAt: { type: String },
    setupAt: { type: String },
    parking: { type: String },
    food: { type: String },
    technicalNotes: { type: String }
  },
  { timestamps: true }
);

export const Show = mongoose.model('Show', showSchema);
