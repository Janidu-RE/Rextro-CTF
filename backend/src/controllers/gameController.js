import Player from '../models/Player.js';
import Flag from '../models/Flag.js';
import Round from '../models/Round.js';

// 1. Player Login
export const playerLogin = async (req, res) => {
  try {
    const { whatsapp } = req.body;
    
    // Find player by unique WhatsApp number
    const player = await Player.findOne({ whatsapp });
    
    if (!player) {
      return res.status(404).json({ message: 'Phone number not registered. Please contact Admin.' });
    }

    res.json(player);
  } catch (error) {
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
      return res.status(404).json({ message: 'Player not found.' });
    }

    // Check if already solved
    if (player.solvedFlags.includes(flag._id)) {
      return res.status(400).json({ message: 'You have already captured this flag!' });
    }

    // --- SCORING LOGIC ---
    // Base Points + (Remaining Seconds * 0.1)
    const timeBonus = Math.max(0, round.remainingTime * 0.1);
    
    // Ensure points are float with 2 decimal places for uniqueness
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
    console.error(error);
    res.status(500).json({ message: 'Submission error' });
  }
};

// 3. Get Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    // Sort by Score (Desc), then by who submitted last (Asc - earlier is better for ties)
    const leaderboard = await Player.find()
      .select('name score solvedFlags')
      .sort({ score: -1, lastSubmissionTime: 1 })
      .limit(20); // Top 20

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Leaderboard error' });
  }
};