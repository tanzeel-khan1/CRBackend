const IdeaComment = require('../models/IdeaComment');

const getComments = async (req, res) => {
  const filter = {};
  if (req.query.idea_id) filter.idea_id = req.query.idea_id;
  const comments = await IdeaComment.find(filter).sort({ createdAt: 1 });
  res.json(comments);
};

const createComment = async (req, res) => {
  const comment = await IdeaComment.create({ ...req.body, author_email: req.user.email });
  res.status(201).json(comment);
};

module.exports = { getComments, createComment };
