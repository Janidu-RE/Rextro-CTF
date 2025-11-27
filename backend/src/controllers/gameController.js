import Player from '../models/Player.js';
import Flag from '../models/Flag.js';
import Round from '../models/Round.js';

// 1. Player Login
export const playerLogin = async (req, res) => {
  try {
    const { whatsapp } = req.body;
    const player = await Player.findOne({ whatsapp });
    
    if (!player) {
      return res.status(404).json({ message: 'Number not found. Please register with Admin first.' });
    }

    res.json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login error' });
  }
};

// 2. Submit Flag
export const submitFlag = async (req, res) => {
  try {
    const { playerId, flagCode } = req.body;

    const round = await Round.findOne({ active: true });
    if (!round) {
      return res.status(400).json({ message: 'No active round currently running.' });
    }

    const flag = await Flag.findOne({ code: flagCode });
    if (!flag) {
      return res.status(404).json({ message: 'Invalid Flag Code.' });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player session invalid.' });
    }

    if (player.solvedFlags.includes(flag._id)) {
      return res.status(400).json({ message: 'Flag already captured!' });
    }

    // Scoring: Base + (Remaining Seconds * 0.1)
    const timeBonus = Math.max(0, round.remainingTime * 0.1);
    const totalPoints = parseFloat((flag.points + timeBonus).toFixed(2));

    player.score += totalPoints;
    player.solvedFlags.push(flag._id);
    player.lastSubmissionTime = new Date();
    
    await player.save();

    res.json({ 
      success: true, 
      message: `Flag Captured! +${totalPoints} Points`, 
      pointsAdded: totalPoints,
      newScore: player.score 
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error processing submission' });
  }
};

// 3. Get Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const activeRound = await Round.findOne({ active: true });
    let query = {};

    if (activeRound) {
      query = { groupId: activeRound.groupId };
    } else {
      const lastPlayed = await Player.findOne({ status: 'finished' })
        .sort({ updatedAt: -1 });

      if (lastPlayed) {
        const batchTimeWindow = new Date(lastPlayed.updatedAt.getTime() - 5000);
        query = { 
          status: 'finished', 
          updatedAt: { $gte: batchTimeWindow } 
        };
      } else {
        return res.json([]);
      }
    }

    const leaderboard = await Player.find(query)
      .select('name score solvedFlags')
      .sort({ score: -1, lastSubmissionTime: 1 });

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

// 4. Get Game Status (ADD THIS FUNCTION)
export const getGameStatus = async (req, res) => {
  try {
    const activeRound = await Round.findOne({ active: true });
    if (!activeRound) {
      return res.json({ active: false, remainingTime: 0 });
    }
    res.json({ 
      active: true, 
      remainingTime: activeRound.remainingTime
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    res.status(500).json({ message: 'Status error' });
  }
};