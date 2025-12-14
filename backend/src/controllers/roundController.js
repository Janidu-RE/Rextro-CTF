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
    const { groupId, flagSet } = req.body;

    await Round.updateMany({ active: true }, { active: false, endTime: new Date() });

    // Generate Random Session ID (6 chars)
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 25 Minutes expiry


    // Fetch group to get players
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const round = new Round({
      groupId,
      players: group.players, // Snapshot players
      startTime: new Date(),
      active: true,
      remainingTime: 25 * 60,
      flagSet: flagSet || 1,
      sessionId,
      sessionExpiresAt
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
      await Player.updateMany(
        { _id: { $in: group.players } },
        { status: 'finished', alreadyPlayed: true }
      );
      await Group.updateOne({ _id: groupId }, { roundCompleted: true, currentRound: false });
    }

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

export const addTime = async (req, res) => {
  try {
    // targetType: 'group' | 'player'
    // targetId: groupId | playerId
    // minutes, seconds
    const { targetType, targetId, minutes, seconds } = req.body;

    // Default to global round if no target specified (backward compatibility)
    if (!targetType) {
      const activeRound = await Round.findOne({ active: true });
      if (!activeRound) return res.status(404).json({ message: 'No active round' });

      const addedSeconds = (parseInt(minutes || 0) * 60) + parseInt(seconds || 0);
      activeRound.remainingTime += addedSeconds;
      if (activeRound.sessionExpiresAt) {
        activeRound.sessionExpiresAt = new Date(activeRound.sessionExpiresAt.getTime() + addedSeconds * 1000);
      }
      await activeRound.save();
      return res.json({ success: true, message: 'Global time updated' });
    }

    const addedSeconds = (parseInt(minutes || 0) * 60) + parseInt(seconds || 0);

    if (targetType === 'group') {
      // Find round by groupId
      // Ideally, we should find the ACTIVE round for this group.
      // Assuming one active round per group logic or global active round where group is participating?
      // Current logic: Round.findOne({ active: true }).
      // If the system supports multiple concurrent rounds for different groups, we need to query by groupId.
      // If it's a single global round for one group, we just check if that group matches.

      // Let's assume we want to extend the ACTIVE round if it belongs to this group.
      const activeRound = await Round.findOne({ active: true, groupId: targetId });

      if (activeRound) {
        activeRound.remainingTime += addedSeconds;
        if (activeRound.sessionExpiresAt) {
          activeRound.sessionExpiresAt = new Date(activeRound.sessionExpiresAt.getTime() + addedSeconds * 1000);
        }
        await activeRound.save();
        return res.json({ success: true, message: `Added time for Group` });
      } else {
        return res.status(404).json({ message: 'No active round found for this group' });
      }
    } else if (targetType === 'player') {
      const player = await Player.findById(targetId);
      if (!player) return res.status(404).json({ message: 'Player not found' });

      player.extraTime = (player.extraTime || 0) + addedSeconds;
      await player.save();
      return res.json({ success: true, message: `Added time for ${player.name}` });
    }

    res.status(400).json({ message: 'Invalid target type' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding time' });
  }
};