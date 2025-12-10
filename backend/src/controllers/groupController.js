import Group from '../models/Group.js';
import Player from '../models/Player.js';

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('players');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createGroup = async (req, res) => {
  try {
    // 1. Determine Start Time
    const lastGroup = await Group.findOne().sort({ startTime: -1 });
    let nextStartTime = new Date();

    if (lastGroup) {
      nextStartTime = new Date(lastGroup.startTime);
      nextStartTime.setMinutes(nextStartTime.getMinutes() + 30);
    } else {
      nextStartTime.setMinutes(nextStartTime.getMinutes() + 30);
    }

    // 2. Generate Sequential Name (Team 1, Team 2, ...)
    // Find all groups whose name starts with "Team "
    const existingGroups = await Group.find({ name: /^Team \d+$/ });

    let nextTeamNumber = 1;
    if (existingGroups.length > 0) {
      const numbers = existingGroups.map(g => {
        const match = g.name.match(/^Team (\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
        // Filter out unreasonably large numbers (timestamps) to avoid "Team 173..."
        .filter(n => n < 1000000);

      if (numbers.length > 0) {
        nextTeamNumber = Math.max(...numbers) + 1;
      }
    }

    const newGroup = new Group({
      name: `Team ${nextTeamNumber}`,
      players: [],
      startTime: nextStartTime
    });

    await newGroup.save();

    // Return all groups to refresh UI
    const groups = await Group.find().populate('players');
    res.json(groups);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Error creating group' });
  }
};

export const updateGroupTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime } = req.body;
    const group = await Group.findByIdAndUpdate(
      id,
      { startTime: new Date(startTime) },
      { new: true }
    ).populate('players');
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBulkGroupTimes = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { startTime } = req.body;
    const groups = await Group.find({ roundCompleted: false }).sort({ startTime: 1 });

    if (!groups.length) return res.status(404).json({ message: 'No active groups found' });

    const startIndex = groups.findIndex(g => g._id.toString() === groupId);
    if (startIndex === -1) return res.status(404).json({ message: 'Group not found' });

    let updatedTime = new Date(startTime);
    const bulkUpdates = groups.slice(startIndex).map(g => {
      const update = {
        updateOne: { filter: { _id: g._id }, update: { startTime: new Date(updatedTime) } }
      };
      updatedTime = new Date(updatedTime.getTime() + 30 * 60000);
      return update;
    });

    await Group.bulkWrite(bulkUpdates);
    const updatedGroups = await Group.find({ roundCompleted: false }).populate('players').sort({ startTime: 1 });
    res.json(updatedGroups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addPlayerToGroup = async (req, res) => {
  try {
    const { groupId, playerId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.players.length >= 6) return res.status(400).json({ message: 'Group is full' });

    await Group.findByIdAndUpdate(groupId, { $addToSet: { players: playerId } });
    await Player.findByIdAndUpdate(playerId, { groupId });

    const groups = await Group.find().populate('players');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removePlayerFromGroup = async (req, res) => {
  try {
    const { groupId, playerId } = req.params;
    await Group.findByIdAndUpdate(groupId, { $pull: { players: playerId } });
    await Player.findByIdAndUpdate(playerId, { $unset: { groupId: 1 } });
    await Group.deleteMany({ players: { $size: 0 } });

    const groups = await Group.find().populate('players');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};