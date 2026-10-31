const softDeletePlugin = (schema) => {
  schema.add({
    deleted_at: { type: Date, default: null, index: true },
    deleted_by: { type: String, default: null },
  });

  const filterActiveDocuments = function filterActiveDocuments() {
    const options = this.getOptions();
    if (options.includeSoftDeleted) {
      delete options.includeSoftDeleted;
    } else {
      this.where({ deleted_at: null });
    }

    if (options.softDeleteOperation) {
      delete options.softDeleteOperation;
      return;
    }

    const update = this.getUpdate();
    if (!update) return;
    const protectFields = (values) => {
      if (!values || typeof values !== 'object') return;
      delete values.deleted_at;
      delete values.deleted_by;
    };
    if (Array.isArray(update)) {
      update.forEach((stage) => Object.values(stage).forEach(protectFields));
    } else {
      protectFields(update);
      Object.values(update || {}).forEach(protectFields);
    }
    this.setUpdate(update);
  };

  schema.pre(
    [
      'find',
      'findOne',
      'count',
      'countDocuments',
      'distinct',
      'findOneAndUpdate',
      'findOneAndReplace',
      'updateOne',
      'updateMany',
      'replaceOne',
    ],
    filterActiveDocuments
  );

  schema.pre('save', function preventNewDeletedDocuments() {
    if (this.isNew) {
      this.deleted_at = null;
      this.deleted_by = null;
    }
  });

  schema.pre('aggregate', function filterDeletedFromAggregate() {
    if (this.options.includeSoftDeleted) {
      delete this.options.includeSoftDeleted;
      return;
    }
    const pipeline = this.pipeline();
    const match = { $match: { deleted_at: null } };
    const firstStage = pipeline[0] && Object.keys(pipeline[0])[0];
    pipeline.splice(firstStage === '$geoNear' || firstStage === '$search' ? 1 : 0, 0, match);
  });

  schema.statics.restoreSoftDeletedById = function restoreSoftDeletedById(id) {
    return this.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      { $set: { deleted_at: null, deleted_by: null } },
      {
        new: true,
        runValidators: true,
        includeSoftDeleted: true,
        softDeleteOperation: true,
      }
    );
  };

  schema.statics.purgeSoftDeletedById = function purgeSoftDeletedById(id) {
    return this.findOneAndDelete(
      { _id: id, deleted_at: { $ne: null } }
    );
  };
};

module.exports = softDeletePlugin;
