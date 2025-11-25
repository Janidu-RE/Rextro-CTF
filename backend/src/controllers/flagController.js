import Flag from '../models/Flag.js';

// Middleware helper to check admin role
const isSuperAdmin = (req) => {
  return req.user && req.user.role === 'super_admin';
};

export const getFlags = async (req, res) => {
  try {
    // Only Super Admin can see the list of flags
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const flags = await Flag.find().sort({ createdAt: -1 });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching flags' });
  }
};

export const createFlag = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { name, code, points } = req.body;

    // Check if flag code already exists
    const existingFlag = await Flag.findOne({ code });
    if (existingFlag) {
      return res.status(400).json({ message: 'Flag code already exists' });
    }

    const flag = new Flag({ name, code, points });
    await flag.save();

    const flags = await Flag.find().sort({ createdAt: -1 });
    res.json(flags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating flag' });
  }
};

export const deleteFlag = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { id } = req.params;
    await Flag.findByIdAndDelete(id);

    const flags = await Flag.find().sort({ createdAt: -1 });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting flag' });
  }
};