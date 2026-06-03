const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

test('verifyToken restricts accepted JWT algorithms to HS256', () => {
  process.env.JWT_SECRET = 'test-secret';

  const originalLoad = Module._load;
  let capturedOptions;

  delete require.cache[require.resolve('../middleware/auth')];

  Module._load = (request, parent, isMain) => {
    if (request === 'jsonwebtoken') {
      return {
        sign: () => 'signed-token',
        verify: (_token, _secret, options) => {
          capturedOptions = options;
          return { id: 'user-1', username: 'test-user', role: 'member' };
        }
      };
    }

    return originalLoad(request, parent, isMain);
  };

  try {
    const { verifyToken } = require('../middleware/auth');

    const decoded = verifyToken('signed-token');

    assert.deepEqual(decoded, {
      id: 'user-1',
      username: 'test-user',
      role: 'member'
    });
    assert.deepEqual(capturedOptions, { algorithms: ['HS256'] });
  } finally {
    Module._load = originalLoad;
    delete require.cache[require.resolve('../middleware/auth')];
  }
});
