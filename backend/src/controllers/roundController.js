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

    startGlobalCountdown(); // Start service timer

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
    
    // Cleanup Logic
    await Round.deleteOne({ _id: activeRound._id });
    const group = await Group.findById(groupId);
    if(group) {
        await Player.updateMany(
            { _id: { $in: group.players } },
            { 
              status: 'finished', 
              groupId: null,
              alreadyPlayed: true // <--- ADD THIS LINE
            }
        );
        await Group.deleteOne({ _id: groupId });
    }

    stopGlobalCountdown(); // Stop service timer

    res.json({ message: 'Round ended and players marked as played' });
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