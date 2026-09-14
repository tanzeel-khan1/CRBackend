const express = require("express");

const router = express.Router();


const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
    getEventsByCompany,
} = require("../controllers/eventController");


router.get("/company/:companyId", getEventsByCompany);

// GET ALL EVENTS
router.get("/", getAllEvents);


// GET SINGLE EVENT
router.get("/:id", getEventById);


// CREATE EVENT
router.post("/", createEvent);


// UPDATE EVENT
router.put("/:id", updateEvent);


// DELETE EVENT
router.delete("/:id", deleteEvent);



module.exports = router;