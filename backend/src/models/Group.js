import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: { type: String },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  startTime: { type: Date, required: true },
  roundCompleted: { type: Boolean, default: false },
  currentRound: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Group', GroupSchema);