const Event = require("../models/Event");
const mongoose = require('mongoose');
const { canAccessCompany } = require('../middleware/companyAccess');
const { softDeleteById } = require('../utils/softDelete');

const EVENT_FIELDS = [
  'title',
  'type',
  'description',
  'date',
  'startTime',
  'endTime',
  'mode',
  'meetingLink',
  'location',
  'attendees',
  'reminder',
  'status',
];

const pickEventFields = (body) => Object.fromEntries(
  EVENT_FIELDS
    .filter((field) => Object.prototype.hasOwnProperty.call(body || {}, field))
    .map((field) => [field, body[field]])
);

const populateEventCompany = (query) => query.populate('company', 'name');

const getEventForCompanyMember = async (eventId, userEmail) => {
  const event = await Event.findById(eventId);
  if (!event) return { event: null, allowed: false };

  const allowed = await canAccessCompany(userEmail, event.company.toString());
  return { event, allowed };
};

exports.getAllEvents = async (req, res) => {
  const { company_id: companyId } = req.query;
  if (!mongoose.isValidObjectId(companyId)) {
    return res.status(400).json({ success: false, message: 'A valid company_id is required' });
  }
  if (!await canAccessCompany(req.user.email, companyId)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const events = await populateEventCompany(Event.find({ company: companyId }))
    .sort({ date: 1 });
  return res.json({ success: true, count: events.length, data: events });
};

exports.getEventById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  const { event, allowed } = await getEventForCompanyMember(req.params.id, req.user.email);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

  await event.populate('company', 'name');
  return res.json({ success: true, data: event });
};

exports.createEvent = async (req, res) => {
  const companyId = req.body.company;
  if (!mongoose.isValidObjectId(companyId)) {
    return res.status(400).json({ success: false, message: 'A valid company is required' });
  }
  if (!await canAccessCompany(req.user.email, companyId)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const event = await Event.create({
    ...pickEventFields(req.body),
    company: companyId,
    createdBy: req.user._id,
  });
  return res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event,
  });
};

exports.updateEvent = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  const { event, allowed } = await getEventForCompanyMember(req.params.id, req.user.email);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

  Object.assign(event, pickEventFields(req.body));
  await event.save();
  return res.json({
    success: true,
    message: 'Event updated successfully',
    data: event,
  });
};

exports.deleteEvent = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid event ID' });
  }

  const { event, allowed } = await getEventForCompanyMember(req.params.id, req.user.email);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

  await softDeleteById(Event, req.params.id, req.user.email);
  return res.json({ success: true, message: 'Event deleted successfully' });
};

exports.getEventsByCompany = async (req, res) => {
  const { companyId } = req.params;
  if (!mongoose.isValidObjectId(companyId)) {
    return res.status(400).json({ success: false, message: 'Invalid company ID' });
  }
  if (!await canAccessCompany(req.user.email, companyId)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const events = await populateEventCompany(Event.find({ company: companyId }))
    .sort({ date: 1 });
  return res.json({ success: true, count: events.length, data: events });
};