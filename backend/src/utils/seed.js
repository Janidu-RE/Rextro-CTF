import bcrypt from 'bcryptjs';
import User from '../models/user.js';

export const initializeUsers = async () => {
  try {
    const users = [
      { username: 'super', password: 'superpass', role: 'super_admin', name: 'Super Admin' },
      { username: 'player', password: 'playerpass', role: 'player_manager', name: 'Player Manager' },
      { username: 'round', password: 'roundpass', role: 'round_manager', name: 'Round Manager' }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashedPassword });
        console.log(`Created user: ${userData.username}`);
      }
    }
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};