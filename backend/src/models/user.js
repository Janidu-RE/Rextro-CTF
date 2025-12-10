import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['super_admin', 'player_manager', 'round_manager'] },
  name: { type: String, required: true }
});

export default mongoose.model('User', UserSchema);