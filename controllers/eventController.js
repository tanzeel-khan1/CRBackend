const Event = require("../models/Event");
// =======================
// GET ALL EVENTS
// =======================
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("company", "name")
      .populate("createdBy", "name email")
      .populate("attendees", "name email")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =======================
// GET SINGLE EVENT
// =======================
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("company", "name")
      .populate("createdBy", "name email")
      .populate("attendees", "name email");


    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    res.status(200).json({
      success: true,
      data: event,
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =======================
// CREATE EVENT
// =======================
exports.createEvent = async (req, res) => {
  try {

    const event = await Event.create(req.body);


    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });


  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};



// =======================
// UPDATE EVENT
// =======================
exports.updateEvent = async (req, res) => {
  try {


    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );


    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });


  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};




// =======================
// DELETE EVENT
// =======================
exports.deleteEvent = async (req, res) => {
  try {


    const event = await Event.findByIdAndDelete(req.params.id);


    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });


  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =======================
// GET EVENTS BY COMPANY ID
// =======================
exports.getEventsByCompany = async (req, res) => {
  try {

    const { companyId } = req.params;


    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }



    const events = await Event.find({
      company: companyId,
    })
      .populate("company", "name")
      .populate("createdBy", "name email")
      .populate("attendees", "name email")
      .sort({ date: 1 });



    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });



  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};