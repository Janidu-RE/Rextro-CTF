import Round from '../models/Round.js';
import Group from '../models/Group.js';
import Player from '../models/Player.js';

let globalCountdownInterval = null;

// --- Timer Logic ---

export const autoEndRound = async () => {
  try {
    console.log('Auto-ending round due to time expiration');
    
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
    console.log('Round auto-ended successfully');
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
        
        // Optional: emit socket event here if you use Socket.io later
        
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

// --- Auto Assign Logic ---

export const autoAssignGroups = async () => {
  try {
    // Updated query: Only find players not in a group AND who haven't played yet
    const ungroupedPlayers = await Player.find({ 
      groupId: { $exists: false },
      alreadyPlayed: { $ne: true } 
    });
    
    if (ungroupedPlayers.length >= 6) {
      const lastGroup = await Group.findOne().sort({ startTime: -1 });
      let nextStartTime = new Date();
      
      if (lastGroup) {
        nextStartTime = new Date(lastGroup.startTime);
        nextStartTime.setMinutes(nextStartTime.getMinutes() + 30);
      } else {
        nextStartTime.setMinutes(nextStartTime.getMinutes() + 30);
      }

      const playersToAssign = ungroupedPlayers.slice(0, 6);
      const newGroup = new Group({
        name: `Team ${Date.now()}`,
        players: playersToAssign.map(p => p._id),
        startTime: nextStartTime
      });

      await newGroup.save();

      await Player.updateMany(
        { _id: { $in: playersToAssign.map(p => p._id) } },
        { groupId: newGroup._id }
      );
    }
  } catch (error) {
    console.error('Auto-assign groups error:', error);
  }
};