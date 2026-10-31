const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const BusinessPlan = require('../models/BusinessPlan');
const ChatMessage = require('../models/ChatMessage');
const Client = require('../models/Client');
const Company = require('../models/Company');
const Contract = require('../models/Contract');
const DocSection = require('../models/DocSection');
const Document = require('../models/Document');
const Employee = require('../models/Employee');
const Event = require('../models/Event');
const Expense = require('../models/Expense');
const Feedback = require('../models/Feedback');
const Goal = require('../models/Goals');
const Hpc = require('../models/Hpc');
const Idea = require('../models/Idea');
const IdeaComment = require('../models/IdeaComment');
const Invoice = require('../models/Invoice');
const Investor = require('../models/Investor');
const Note = require('../models/Note');
const Password = require('../models/Password');
const Property = require('../models/Property');
const Step = require('../models/Step');

const TRASH_MODELS = {
  activities: Activity,
  'business-plan': BusinessPlan,
  chat: ChatMessage,
  clients: Client,
  companies: Company,
  contracts: Contract,
  'doc-sections': DocSection,
  documents: Document,
  employees: Employee,
  events: Event,
  expenses: Expense,
  feedback: Feedback,
  goals: Goal,
  hpcs: Hpc,
  ideas: Idea,
  'idea-comments': IdeaComment,
  invoices: Invoice,
  investors: Investor,
  notes: Note,
  passwords: Password,
  properties: Property,
  steps: Step,
};

const CASCADE_MODELS = {
  clients: { model: Feedback, foreignKey: 'client_id' },
  'doc-sections': { model: Document, foreignKey: 'section_id' },
  ideas: { model: IdeaComment, foreignKey: 'idea_id' },
};
const COMPANY_MODELS = [
  { model: Activity, field: 'company_id' },
  { model: BusinessPlan, field: 'company_id' },
  { model: ChatMessage, field: 'company_id', stringify: true },
  { model: Client, field: 'company_id' },
  { model: Contract, field: 'company_id' },
  { model: DocSection, field: 'company_id' },
  { model: Document, field: 'company_id' },
  { model: Employee, field: 'company_id' },
  { model: Event, field: 'company' },
  { model: Expense, field: 'company_id' },
  { model: Feedback, field: 'company_id' },
  { model: Hpc, field: 'company_id' },
  { model: Idea, field: 'company_id' },
  { model: IdeaComment, field: 'company_id' },
  { model: Invoice, field: 'company_id' },
  { model: Investor, field: 'company_id' },
  { model: Note, field: 'company_id' },
  { model: Password, field: 'company_id' },
  { model: Property, field: 'company_id' },
  { model: Step, field: 'company_id' },
];

const getLabel = (record) => (
  record.title
  || record.name
  || record.site_name
  || record.action
  || record.client_name
  || record.invoice_number
  || record.section_type
  || record.content?.slice(0, 80)
  || record._id.toString()
);

const getTrash = async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const groups = await Promise.all(Object.entries(TRASH_MODELS).map(async ([resource, Model]) => {
      const records = await Model.find({ deleted_at: { $ne: null }, deleted_by: email })
        .setOptions({ includeSoftDeleted: true })
        .sort({ deleted_at: -1 })
        .limit(100);
      return records.map((record) => ({
        resource,
        id: record._id.toString(),
        label: getLabel(record),
        deleted_by: record.deleted_by,
        deleted_at: record.deleted_at,
      }));
    }));

    res.json(groups.flat().sort((a, b) => b.deleted_at - a.deleted_at).slice(0, 500));
  } catch (error) {
    next(error);
  }
};

const getDeletedRecord = async (resource, id, email) => {
  const Model = TRASH_MODELS[resource];
  if (!Model || !mongoose.isValidObjectId(id)) return null;
  return Model.findOne({ _id: id, deleted_at: { $ne: null }, deleted_by: email })
    .setOptions({ includeSoftDeleted: true });
};

const restoreTrashItem = async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const { resource, id } = req.params;
    const deletedRecord = await getDeletedRecord(resource, id, email);
    if (!deletedRecord) return res.status(404).json({ message: 'Deleted item not found' });

    const Model = TRASH_MODELS[resource];
    const restored = await Model.restoreSoftDeletedById(id);
    if (!restored) return res.status(404).json({ message: 'Deleted item not found' });
    const dependent = CASCADE_MODELS[resource];
    if (dependent) {
      await dependent.model.updateMany(
        {
          [dependent.foreignKey]: deletedRecord._id,
          deleted_at: { $ne: null },
          deleted_by: email,
        },
        { $set: { deleted_at: null, deleted_by: null } }
      ).setOptions({ includeSoftDeleted: true, softDeleteOperation: true });
    }

    res.json({ message: 'Item restored', item: restored });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A record with the same unique value already exists. Resolve the conflict before restoring this item.' });
    }
    next(error);
  }
};

const purgeTrashItem = async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const { resource, id } = req.params;
    const deletedRecord = await getDeletedRecord(resource, id, email);
    if (!deletedRecord) return res.status(404).json({ message: 'Deleted item not found' });

    const dependent = CASCADE_MODELS[resource];
    if (dependent) {
      await dependent.model.deleteMany({
        [dependent.foreignKey]: deletedRecord._id,
        deleted_at: { $ne: null },
        deleted_by: email,
      });
    }
    if (resource === 'companies') {
      await Promise.all(COMPANY_MODELS.map(({ model: ChildModel, field, stringify }) => (
        ChildModel.deleteMany({ [field]: stringify ? deletedRecord._id.toString() : deletedRecord._id })
      )));
    }
    await TRASH_MODELS[resource].purgeSoftDeletedById(id);
    res.json({ message: 'Item permanently deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrash, restoreTrashItem, purgeTrashItem };
