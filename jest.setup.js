// jest.setup.js
require('@testing-library/jest-dom');

// Manual cookie mock management
exports.storedCookies = {};

Object.defineProperty(window.document, 'cookie', {
  get: function() {
    return Object.entries(exports.storedCookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  },
  set: function(cookieString) {
    const parts = cookieString.split(';').map(s => s.trim());
    const firstPart = parts[0];
    const eqIndex = firstPart.indexOf('=');

    let name, value;
    if (eqIndex > -1) {
        name = firstPart.substring(0, eqIndex);
        value = firstPart.substring(eqIndex + 1);
    } else {
        name = firstPart;
        value = ''; // No value, treat as empty
    }

    const isDeletion = cookieString.includes('expires=Thu, 01 Jan 1970');

    if (isDeletion) {
      delete exports.storedCookies[name.trim()];
    } else if (name && value !== undefined) {
      exports.storedCookies[name.trim()] = value;
    }
  },
  configurable: true,
});

beforeEach(() => {
  for (const key in exports.storedCookies) {
    delete exports.storedCookies[key];
  }
});
