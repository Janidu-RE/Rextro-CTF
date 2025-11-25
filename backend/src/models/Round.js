import mongoose from 'mongoose';

const RoundSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  active: { type: Boolean, default: true },
  remainingTime: { type: Number, default: 1200 } // 20 minutes in seconds
}, { timestamps: true });

export default mongoose.model('Round', RoundSchema);