import Round from '../models/Round.js';
import Group from '../models/Group.js';
import Player from '../models/Player.js';

let globalCountdownInterval = null;

// --- Timer Logic ---

export const autoEndRound = async () => {
  try {

    // 1. Find the active round first so we can get the groupId
    const activeRound = await Round.findOne({ active: true });

    if (activeRound) {
      const group = await Group.findById(activeRound.groupId);
      if (group) {
        // CRITICAL: Update players to mark them as played
        await Player.updateMany(
          { _id: { $in: group.players } },
          {
            status: 'finished',
            groupId: null,
            alreadyPlayed: true
          }
        );
        // Delete the group
        await Group.deleteOne({ _id: activeRound.groupId });
      }

      // Deactivate the round
      activeRound.active = false;
      activeRound.endTime = new Date();
      activeRound.remainingTime = 0;
      await activeRound.save();
    }

    // Cleanup any lingering currentRound flags
    await Group.updateMany({ currentRound: true }, {
      currentRound: false,
      roundCompleted: true
    });

    stopGlobalCountdown();
  } catch (error) {
    console.error('Auto-end round error:', error);
  }
};

export const startGlobalCountdown = () => {
  if (globalCountdownInterval) clearInterval(globalCountdownInterval);

  globalCountdownInterval = setInterval(async () => {
    try {
      const activeRound = await Round.findOne({ active: true });

      if (!activeRound) {
        stopGlobalCountdown();
        return;
      }

      if (activeRound.remainingTime > 0) {
        activeRound.remainingTime -= 1;
        await activeRound.save();

        if (activeRound.remainingTime === 0) {
          await autoEndRound();
        }
      }
    } catch (error) {
      console.error('Global countdown error:', error);
    }
  }, 1000);
};

export const stopGlobalCountdown = () => {
  if (globalCountdownInterval) {
    clearInterval(globalCountdownInterval);
    globalCountdownInterval = null;
  }
};

// --- Auto Assign Logic (UPDATED) ---

export const autoAssignGroups = async () => {
  try {

    // 1. Fetch ALL eligible waiting players
    // REMOVED strict status check. Now relying on:
    // - Not in a group (groupId is null or missing)
    // - Has not played yet (alreadyPlayed is false or missing)
    const query = {
      $or: [{ groupId: { $exists: false } }, { groupId: null }],
      alreadyPlayed: { $ne: true }
    };

    const ungroupedPlayers = await Player.find(query).sort({ createdAt: 1 });

    // Debug Logging
    if (ungroupedPlayers.length === 0) {
      const total = await Player.countDocuments();
    } else {
      console.log(`Found ${ungroupedPlayers.length} eligible waiting players.`);
    }

    // 2. Loop to create as many groups of 6 as possible
    const GROUP_SIZE = 6;
    let processedCount = 0;

    // While we have at least GROUP_SIZE players remaining in the list...
    while ((ungroupedPlayers.length - processedCount) >= GROUP_SIZE) {

      // Take the next batch of players
      const playersToAssign = ungroupedPlayers.slice(processedCount, processedCount + GROUP_SIZE);

      // Determine Start Time based on the absolute latest group in DB
      const lastGroup = await Group.findOne().sort({ startTime: -1 });
      let nextStartTime = new Date();

      if (lastGroup) {
        nextStartTime = new Date(lastGroup.startTime);
        nextStartTime.setMinutes(nextStartTime.getMinutes() + 30);
      } else {
        // If no groups exist, start 30 mins from now
        nextStartTime.setMinutes(nextStartTime.getMinutes() + 30);
      }

      // Generate Sequential Name
      const existingGroups = await Group.find({ name: /^Team \d+$/ });
      let nextTeamNumber = 1;

      if (existingGroups.length > 0) {
        const numbers = existingGroups.map(g => {
          const match = g.name.match(/^Team (\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
          // Filter out timestamps
          .filter(n => n < 1000000);

        if (numbers.length > 0) {
          nextTeamNumber = Math.max(...numbers) + 1;
        }
      }

      // Create Group
      const newGroup = new Group({
        name: `Team ${nextTeamNumber}`, // Sequential name
        players: playersToAssign.map(p => p._id),
        startTime: nextStartTime
      });

      await newGroup.save();

      // Update these players to belong to the new group
      await Player.updateMany(
        { _id: { $in: playersToAssign.map(p => p._id) } },
        { groupId: newGroup._id, status: 'playing' } // Also update status for consistency
      );

      console.log(`[Auto-Group] Created '${newGroup.name}' with ${GROUP_SIZE} players.`);

      // Increment counter to process the next batch
      processedCount += GROUP_SIZE;
    }

    if (processedCount === 0 && ungroupedPlayers.length > 0) {
      console.log(`Waiting for more players... Has ${ungroupedPlayers.length}, Need ${GROUP_SIZE}`);
    }

  } catch (error) {
    console.error('Auto-assign groups error:', error);
  }
};