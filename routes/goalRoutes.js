const express = require("express");
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create goal
router.post("/", asyncHandler(createGoal));

// Get all goals
router.get("/", asyncHandler(getGoals));

// Get single goal
router.get("/:id", asyncHandler(getGoalById));

// Update goal
router.put("/:id", asyncHandler(updateGoal));

// Delete goal
router.delete("/:id", asyncHandler(deleteGoal));

module.exports = router;