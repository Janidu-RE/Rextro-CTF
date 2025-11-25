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