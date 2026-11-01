const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { askAI } = require("../controllers/aiController");

const router = express.Router();

router.post("/ask", asyncHandler(askAI));

module.exports = router;