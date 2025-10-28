import fs from 'fs';
import path from 'path';

describe('package.json configuration', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );

  it('defines the expected scripts for quality and testing', () => {
    expect(pkg.scripts['type-check']).toBe('tsc --noEmit');
    expect(pkg.scripts.test).toBe('jest');
    expect(pkg.scripts['test:coverage']).toBe('jest --coverage');
  });

  it('pins critical runtime dependencies', () => {
    expect(pkg.dependencies.next).toBe('16.0.0');
    expect(pkg.dependencies.react).toBe('18.2.0');
    expect(pkg.dependencies['@supabase/supabase-js']).toBe('^2.75.1');
  });

  it('enforces the minimum supported Node.js version', () => {
    expect(pkg.engines.node).toBe('>=20.19.0');
  });
});
