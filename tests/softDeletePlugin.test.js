const test = require('node:test');
const assert = require('node:assert/strict');

require('../config/db');
const Client = require('../models/Client');

const runSoftDeleteHook = (query, hookName = 'filterActiveDocuments') => {
  const hook = Client.schema.s.hooks._pres.get(query.op)
    .find(({ fn }) => fn.name === hookName);
  assert.ok(hook, `Expected ${hookName} middleware for ${query.op}`);
  hook.fn.call(query);
};

test('active queries exclude deleted records and user updates cannot alter deletion metadata', () => {
  const query = Client.findOneAndUpdate(
    { _id: '507f1f77bcf86cd799439011' },
    { $set: { name: 'Updated', deleted_at: new Date(), deleted_by: 'attacker@example.com' } }
  );

  runSoftDeleteHook(query);

  assert.equal(query.getFilter().deleted_at, null);
  assert.deepEqual(query.getUpdate(), { $set: { name: 'Updated' } });
});

test('restore queries may target soft-deleted records without exposing the internal option', () => {
  const query = Client.restoreSoftDeletedById('507f1f77bcf86cd799439011');

  runSoftDeleteHook(query);

  assert.deepEqual(query.getFilter().deleted_at, { $ne: null });
  assert.deepEqual(query.getUpdate(), { $set: { deleted_at: null, deleted_by: null } });
  assert.equal(query.getOptions().includeSoftDeleted, undefined);
  assert.equal(query.getOptions().softDeleteOperation, undefined);
});

test('trash queries can intentionally include deleted records without leaking internal options', () => {
  const query = Client.find({ deleted_by: 'agent@example.com' })
    .setOptions({ includeSoftDeleted: true });

  runSoftDeleteHook(query);

  assert.deepEqual(query.getFilter(), { deleted_by: 'agent@example.com' });
  assert.equal(query.getOptions().includeSoftDeleted, undefined);
});
