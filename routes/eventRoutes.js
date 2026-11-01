const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/auth");

const router = express.Router();


const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
    getEventsByCompany,
} = require("../controllers/eventController");

router.use(protect);

router.get("/company/:companyId", asyncHandler(getEventsByCompany));

// GET ALL EVENTS
router.get("/", asyncHandler(getAllEvents));


// GET SINGLE EVENT
router.get("/:id", asyncHandler(getEventById));


// CREATE EVENT
router.post("/", asyncHandler(createEvent));


// UPDATE EVENT
router.put("/:id", asyncHandler(updateEvent));


// DELETE EVENT
router.delete("/:id", asyncHandler(deleteEvent));



module.exports = router;