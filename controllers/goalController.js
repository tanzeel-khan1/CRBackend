const Goal = require("../models/Goals");
const { respondWithError } = require('../utils/errorResponse');
const { softDeleteOne } = require('../utils/softDelete');

// Create Goal
const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json(goal);
  } catch (error) {
    respondWithError(res, error);
  }
};

// Get all goals of logged-in user
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    res.json(goals);
  } catch (error) {
    respondWithError(res, error);
  }
};

// Get single goal
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch (error) {
    respondWithError(res, error);
  }
};

// Update goal
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch (error) {
    respondWithError(res, error);
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await softDeleteOne(Goal, {
      _id: req.params.id,
      userId: req.user.id,
    }, req.user.email);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    respondWithError(res, error);
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};