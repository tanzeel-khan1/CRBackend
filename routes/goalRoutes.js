const express = require("express");
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create goal
router.post("/", createGoal);

// Get all goals
router.get("/", getGoals);

// Get single goal
router.get("/:id", getGoalById);

// Update goal
router.put("/:id", updateGoal);

// Delete goal
router.delete("/:id", deleteGoal);

module.exports = router;