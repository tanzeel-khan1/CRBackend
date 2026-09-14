const test = require('node:test');
const assert = require('node:assert/strict');

const { getCompanyAccessRoles } = require('../utils/companyAccessRules');

test('company access should include all invited roles, not only owner/admin', () => {
  assert.deepEqual(getCompanyAccessRoles(), [
    'owner',
    'admin',
    'investor',
    'finance_manager',
    'accountant',
    'auditor',
    'viewer',
  ]);
});
