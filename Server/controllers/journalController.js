const Journal = require('../models/Journal');

const getJournals = async (req, res) => {
  const journals = await Journal.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(journals);
};

const createJournal = async (req, res) => {
  if (!req.body.content) return res.status(400).json({ message: 'Content is required' });
  const journal = await Journal.create({
    user: req.user.id,
    content: req.body.content,
    mood: req.body.mood || 'Neutral',
  });
  res.status(201).json(journal);
};

const deleteJournal = async (req, res) => {
  const journal = await Journal.findById(req.params.id);
  if (!journal) return res.status(404).json({ message: 'Journal not found' });
  if (journal.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

  await journal.deleteOne();
  res.json({ message: 'Journal removed' });
};

module.exports = { getJournals, createJournal, deleteJournal };