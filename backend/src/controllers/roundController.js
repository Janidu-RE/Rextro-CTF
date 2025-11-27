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
    const { groupId } = req.body;
    
    // Deactivate any previous active rounds (keep history, don't delete)
    await Round.updateMany({ active: true }, { active: false, endTime: new Date() });

    const round = new Round({
      groupId,
      startTime: new Date(),
      active: true,
      remainingTime: 1200
    });

    await round.save();
    
    await Group.updateMany({}, { currentRound: false });
    await Group.findByIdAndUpdate(groupId, { currentRound: true });

    startGlobalCountdown();

    const currentRound = await Round.findOne({ active: true })
      .populate('groupId')
      .populate({ path: 'groupId', populate: { path: 'players' } });
    res.json(currentRound);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const endRound = async (req, res) => {
  try {
    const activeRound = await Round.findOne({ active: true });
    if (!activeRound) return res.json({ message: 'No active round' });

    const groupId = activeRound.groupId;
    const group = await Group.findById(groupId);

    // 1. Update Players: Mark as played, but KEEP groupId so we can query them for leaderboard
    if (group) {
        await Player.updateMany(
            { _id: { $in: group.players } },
            { 
              status: 'finished', 
              alreadyPlayed: true 
              // Note: We do NOT set groupId to null anymore. 
              // We need it to link them to this round for the leaderboard.
            }
        );
        
        // 2. Mark Group as completed (don't delete)
        await Group.updateOne({ _id: groupId }, { roundCompleted: true, currentRound: false });
    }

    // 3. Mark Round as inactive (don't delete)
    activeRound.active = false;
    activeRound.endTime = new Date();
    activeRound.remainingTime = 0;
    await activeRound.save();

    stopGlobalCountdown();

    res.json({ message: 'Round ended. History preserved.' });
  } catch (error) {
    console.error(error);
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