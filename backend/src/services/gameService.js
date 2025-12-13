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
  // Auto-grouping disabled by user request.
  // Manual grouping is now the primary method.
  return;
};