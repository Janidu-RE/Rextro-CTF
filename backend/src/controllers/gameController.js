import Player from '../models/Player.js';
import Flag from '../models/Flag.js';
import Round from '../models/Round.js';

// --- NEW: Verify Session ID ---
export const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Find active round with this session ID
    const round = await Round.findOne({ active: true, sessionId });

    if (!round) {
      return res.status(401).json({ valid: false, message: 'Invalid or Inactive Session ID' });
    }

    // Check expiry
    if (new Date() > round.sessionExpiresAt) {
      return res.status(401).json({ valid: false, message: 'Session ID has expired' });
    }

    res.json({ valid: true, message: 'Session Validated' });
  } catch (error) {
    res.status(500).json({ message: 'Verification error' });
  }
};

export const playerLogin = async (req, res) => {
  try {
    const { whatsapp } = req.body;
    const player = await Player.findOne({ whatsapp });
    if (!player) return res.status(404).json({ message: 'Number not found.' });
    res.json(player);
  } catch (error) { res.status(500).json({ message: 'Login error' }); }
};

export const submitFlag = async (req, res) => {
  try {
    const { playerId, flagCode } = req.body;
    const round = await Round.findOne({ active: true });
    if (!round) return res.status(400).json({ message: 'No active round.' });

    const flag = await Flag.findOne({ code: flagCode });
    if (!flag) return res.status(404).json({ message: 'Invalid Flag Code.' });

    if (flag.setNumber !== round.flagSet) {
      return res.status(400).json({ message: 'This flag is not active for the current round.' });
    }

    const player = await Player.findById(playerId);
    if (player.solvedFlags.includes(flag._id)) return res.status(400).json({ message: 'Flag already captured!' });

    const timeBonus = Math.max(0, round.remainingTime * 0.1);
    const totalPoints = parseFloat((flag.points + timeBonus).toFixed(2));

    player.score += totalPoints;
    player.solvedFlags.push(flag._id);
    player.lastSubmissionTime = new Date();
    await player.save();

    res.json({ success: true, message: `Captured! +${totalPoints} Pts`, newScore: player.score });
  } catch (error) { res.status(500).json({ message: 'Submission error' }); }
};

export const getLeaderboard = async (req, res) => {
  try {
    let targetRound = await Round.findOne({ active: true });
    if (!targetRound) targetRound = await Round.findOne({ active: false }).sort({ endTime: -1 });

    if (!targetRound) return res.json([]);

    const leaderboard = await Player.find({ groupId: targetRound.groupId })
      .select('name score solvedFlags')
      .sort({ score: -1, lastSubmissionTime: 1 });

    res.json(leaderboard);
  } catch (error) { res.status(500).json({ message: 'Leaderboard error' }); }
};

export const getOverallLeaderboard = async (req, res) => {
  try {
    // Fetch ALL players, regardless of group
    const leaderboard = await Player.find({})
      .select('name score solvedFlags whatsapp status')
      .sort({ score: -1, lastSubmissionTime: 1 }); // Higher score first, then earlier submission time

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Overall Leaderboard error' });
  }
};

export const getGameStatus = async (req, res) => {
  try {
    const { playerId } = req.query;
    const activeRound = await Round.findOne({ active: true });

    if (!activeRound) return res.json({ active: false, remainingTime: 0 });

    let extraTime = 0;
    if (playerId) {
      const player = await Player.findById(playerId);
      if (player) {
        extraTime = player.extraTime || 0;
      }
    }

    // Don't go below 0
    const finalRemaining = Math.max(0, activeRound.remainingTime + extraTime);

    res.json({ active: true, remainingTime: finalRemaining });
  } catch (error) { res.status(500).json({ message: 'Status error' }); }
};

export const getChallenges = async (req, res) => {
  try {
    const activeRound = await Round.findOne({ active: true });
    if (!activeRound) return res.json([]);
    const tasks = await Flag.find({ setNumber: activeRound.flagSet })
      .select('title description link points setNumber');
    res.json(tasks);
  } catch (error) { res.status(500).json({ message: 'Error fetching tasks' }); }
};