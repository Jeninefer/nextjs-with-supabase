const Module = require('node:module');
const path = require('node:path');

const originalResolveFilename = Module._resolveFilename;
const testDistRoot = path.resolve(__dirname, '..', '.test-dist');

const mockMap = new Map([
  ['@/lib/supabase/client', path.resolve(testDistRoot, 'tests', '__mocks__', 'supabase-client.js')],
  ['@/components/ui/button', path.resolve(testDistRoot, 'tests', '__mocks__', 'ui-button.js')],
  ['@/components/ui/card', path.resolve(testDistRoot, 'tests', '__mocks__', 'ui-card.js')],
  ['@/components/ui/input', path.resolve(testDistRoot, 'tests', '__mocks__', 'ui-input.js')],
  ['@/components/ui/label', path.resolve(testDistRoot, 'tests', '__mocks__', 'ui-label.js')],
  ['next/link', path.resolve(testDistRoot, 'tests', '__mocks__', 'next-link.js')],
  ['next/navigation', path.resolve(testDistRoot, 'tests', '__mocks__', 'next-navigation.js')],
  ['@supabase/ssr', path.resolve(testDistRoot, 'tests', '__mocks__', 'supabase-ssr.js')],
  ['tailwind-merge', path.resolve(testDistRoot, 'tests', '__mocks__', 'tailwind-merge.js')],
]);

Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (mockMap.has(request)) {
    const mockPath = mockMap.get(request);
    return originalResolveFilename.call(this, mockPath, parent, isMain, options);
  }

  if (request.startsWith('@/')) {
    const actual = path.resolve(testDistRoot, request.slice(2));
    return originalResolveFilename.call(this, actual, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
