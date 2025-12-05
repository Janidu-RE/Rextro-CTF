import Flag from '../models/Flag.js';

const isSuperAdmin = (req) => {
  return req.user && req.user.role === 'super_admin';
};

export const getFlags = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: 'Access denied.' });
    
    // Sort by Set, then by creation date
    const flags = await Flag.find().sort({ setNumber: 1, createdAt: 1 });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createFlag = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: 'Access denied.' });

    const { title, description, link, code, points, setNumber } = req.body;

    const existingFlag = await Flag.findOne({ code });
    if (existingFlag) return res.status(400).json({ message: 'Flag code already exists' });

    const flag = new Flag({ 
      title, description, link, code, points, 
      setNumber: parseInt(setNumber) 
    });
    
    await flag.save();

    const flags = await Flag.find().sort({ setNumber: 1, createdAt: 1 });
    res.json(flags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating flag' });
  }
};

export const deleteFlag = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: 'Access denied.' });

    await Flag.findByIdAndDelete(req.params.id);
    const flags = await Flag.find().sort({ setNumber: 1, createdAt: 1 });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting flag' });
  }
};