const test = require('node:test');
const assert = require('node:assert/strict');

const { adminOnly } = require('../middleware/auth');

test('unverified allowlisted email cannot access platform admin routes', (t) => {
  const previousAdmins = process.env.PLATFORM_ADMIN_EMAILS;
  t.after(() => {
    if (previousAdmins === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = previousAdmins;
  });
  process.env.PLATFORM_ADMIN_EMAILS = 'admin@example.com';
  let nextCalled = false;
  let responseStatus;
  let responseBody;
  const res = {
    status(status) {
      responseStatus = status;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  adminOnly({
    user: {
      email: 'admin@example.com',
      role: 'user',
      isEmailVerified: false,
    },
  }, res, () => {
    nextCalled = true;
  });

  assert.equal(responseStatus, 403);
  assert.equal(responseBody.message, 'Verify your email address before accessing admin features');
  assert.equal(nextCalled, false);

});

test('verified allowlisted email can access platform admin routes', (t) => {
  const previousAdmins = process.env.PLATFORM_ADMIN_EMAILS;
  t.after(() => {
    if (previousAdmins === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = previousAdmins;
  });
  process.env.PLATFORM_ADMIN_EMAILS = 'admin@example.com';
  let nextCalled = false;

  adminOnly({
    user: {
      email: 'admin@example.com',
      role: 'user',
      isEmailVerified: true,
    },
  }, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});
