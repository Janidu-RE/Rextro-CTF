import mongoose from 'mongoose';

const FlagSchema = new mongoose.Schema({
  // --- Task Details ---
  title: {
    type: String,
    required: true,
    placeholder: "e.g., Binary Exploitation Level 1"
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String, // URL to resource (Google Drive, etc.)
    required: false
  },
  // --- Game Mechanics ---
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    min: 1
  },
  setNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6], // Extended to 6 sets
    default: 1
  }
}, { timestamps: true });

export default mongoose.model('Flag', FlagSchema);