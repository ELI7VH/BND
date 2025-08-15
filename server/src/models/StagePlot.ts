import mongoose from 'mongoose';

const stagePlotSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'user1', index: true },
    contextId: { type: String, required: true, index: true },
    name: { type: String },
    nodes: [
      {
        id: { type: String },
        type: { type: String },
        label: { type: String },
        x: { type: Number },
        y: { type: Number },
        color: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export const StagePlot = mongoose.model('StagePlot', stagePlotSchema);
