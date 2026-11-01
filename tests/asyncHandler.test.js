const test = require('node:test');
const assert = require('node:assert/strict');

const asyncHandler = require('../middleware/asyncHandler');

test('asyncHandler forwards synchronous handler errors to Express', async () => {
  const expectedError = new Error('handler failed');
  let actualError;

  await asyncHandler(() => {
    throw expectedError;
  })({}, {}, (error) => {
    actualError = error;
  });

  assert.equal(actualError, expectedError);
});

test('asyncHandler forwards rejected handler promises to Express', async () => {
  const expectedError = new Error('async handler failed');
  let actualError;

  await asyncHandler(() => Promise.reject(expectedError))({}, {}, (error) => {
    actualError = error;
  });

  assert.equal(actualError, expectedError);
});
