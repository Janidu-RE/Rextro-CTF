import Round from '../models/Round.js';
import Group from '../models/Group.js';
import Player from '../models/Player.js';
import { startGlobalCountdown, stopGlobalCountdown } from '../services/gameService.js';

export const getCurrentRound = async (req, res) => {
  try {
    const currentRound = await Round.findOne({ active: true })
      .populate('groupId')
      .populate({ path: 'groupId', populate: { path: 'players' } });
    res.json(currentRound);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const startRound = async (req, res) => {
  try {
    const { groupId, flagSet } = req.body; // Admin sends flagSet now
    
    // Archive old rounds
    await Round.updateMany({ active: true }, { active: false, endTime: new Date() });

    const round = new Round({
      groupId,
      startTime: new Date(),
      active: true,
      remainingTime: 1200,
      flagSet: flagSet || 1 // Default to set 1 if missing
    });

    await round.save();
    
    // Manage Group state
    await Group.updateMany({}, { currentRound: false });
    await Group.findByIdAndUpdate(groupId, { currentRound: true });

    startGlobalCountdown();

    const currentRound = await Round.findOne({ active: true })
      .populate('groupId')
      .populate({ path: 'groupId', populate: { path: 'players' } });
      
    res.json(currentRound);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error starting round' });
  }
};

export const endRound = async (req, res) => {
  try {
    const activeRound = await Round.findOne({ active: true });
    if (!activeRound) return res.json({ message: 'No active round' });

    const groupId = activeRound.groupId;
    const group = await Group.findById(groupId);

    if (group) {
        // Mark players as finished (History Preserved)
        await Player.updateMany(
            { _id: { $in: group.players } },
            { status: 'finished', alreadyPlayed: true }
        );
        // Mark group finished
        await Group.updateOne({ _id: groupId }, { roundCompleted: true, currentRound: false });
    }

    // Archive Round
    activeRound.active = false;
    activeRound.endTime = new Date();
    activeRound.remainingTime = 0;
    await activeRound.save();

    stopGlobalCountdown();

    res.json({ message: 'Round ended successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateRoundTime = async (req, res) => {
  try {
    const { remainingTime } = req.body;
    await Round.updateOne({ active: true }, { remainingTime });
    res.json({ message: 'Round time updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};