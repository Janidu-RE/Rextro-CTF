import Round from '../models/Round.js';
import Group from '../models/Group.js';
import Player from '../models/Player.js';

let globalCountdownInterval = null;

// --- Timer Logic ---

export const autoEndRound = async () => {
  try {
    console.log('Auto-ending round due to time expiration');
    
    const activeRound = await Round.findOne({ active: true });
    
    if (activeRound) {
        const group = await Group.findById(activeRound.groupId);
        if (group) {
            // 1. Mark players as finished (Keep groupId for leaderboard)
            await Player.updateMany(
                { _id: { $in: group.players } },
                { 
                    status: 'finished', 
                    alreadyPlayed: true 
                }
            );
            
            // 2. Mark Group as completed
            await Group.updateOne({ _id: activeRound.groupId }, { roundCompleted: true, currentRound: false });
        }

        // 3. Archive Round
        activeRound.active = false;
        activeRound.endTime = new Date();
        activeRound.remainingTime = 0;
        await activeRound.save();
    }

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
    // Only pick players who are waiting AND have NOT played yet
    const ungroupedPlayers = await Player.find({ 
      groupId: { $exists: false },
      status: 'waiting',
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