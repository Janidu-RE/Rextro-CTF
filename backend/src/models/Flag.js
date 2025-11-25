import mongoose from 'mongoose';

const FlagSchema = new mongoose.Schema({
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
  name: { 
    type: String, 
    required: true,
    placeholder: "e.g., Binary Exploitation Level 1"
  }
}, { timestamps: true });

export default mongoose.model('Flag', FlagSchema);