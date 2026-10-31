const softDeleteById = (Model, id, deletedBy) => Model.findByIdAndUpdate(
  id,
  { $set: { deleted_at: new Date(), deleted_by: deletedBy || null } },
  { new: true, softDeleteOperation: true }
);

const softDeleteOne = (Model, filter, deletedBy) => Model.findOneAndUpdate(
  filter,
  { $set: { deleted_at: new Date(), deleted_by: deletedBy || null } },
  { new: true, softDeleteOperation: true }
);

const softDeleteMany = (Model, filter, deletedBy) => Model.updateMany(
  filter,
  { $set: { deleted_at: new Date(), deleted_by: deletedBy || null } },
  { softDeleteOperation: true }
);

module.exports = { softDeleteById, softDeleteOne, softDeleteMany };
