import Player from '../models/Player.js';
import Group from '../models/Group.js';
import { autoAssignGroups } from '../services/gameService.js';

export const getPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate('groupId');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPlayer = async (req, res) => {
  try {
    const { name, whatsapp } = req.body;
    const player = new Player({ name, whatsapp });
    await player.save();

    await autoAssignGroups(); // Call the service

    const players = await Player.find().populate('groupId');
    res.json(players);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already registered' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    await Player.findByIdAndDelete(id);

    await Group.updateMany({ players: id }, { $pull: { players: id } });
    await Group.deleteMany({ players: { $size: 0 } });

    const players = await Player.find().populate('groupId');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
