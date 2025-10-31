import fs from 'fs';
import path from 'path';

describe('eslint configuration', () => {
  const configPath = path.join(process.cwd(), 'eslint.config.mjs');
  const configSource = fs.readFileSync(configPath, 'utf8');

  it('extends Next.js core web vitals and customizes linting rules', () => {
    expect(configSource).toContain("compat.extends(\"next/core-web-vitals\")");
    expect(configSource).toContain('"@typescript-eslint/no-unused-vars": "warn"');
  });

  it('ignores Supabase edge function sources', () => {
    expect(configSource).toContain('ignorePatterns: ["supabase/functions/**/*"]');
  });
});
