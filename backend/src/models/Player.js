import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  whatsapp: { 
    type: String, 
    required: true, 
    unique: true // Ensures no duplicate registrations
  },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  score: { type: Number, default: 0 }, // Cumulative score
  solvedFlags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flag' }], // Track solved flags
  lastSubmissionTime: { type: Date }, // For tie-breaking logic if needed
  alreadyPlayed: { type: Boolean, default: false}

}, { timestamps: true });

export default mongoose.model('Player', PlayerSchema);