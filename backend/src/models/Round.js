import mongoose from 'mongoose';

const RoundSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  active: { type: Boolean, default: true },
  remainingTime: { type: Number, default: 1200 },
  flagSet: { type: Number, default: 1 },
  // --- New Session Security ---
  sessionId: { type: String }, // Random string e.g. "X9J-22K"
  sessionExpiresAt: { type: Date } // 25 mins from start
}, { timestamps: true });

export default mongoose.model('Round', RoundSchema);