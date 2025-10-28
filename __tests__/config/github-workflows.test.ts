import fs from 'fs';
import path from 'path';

describe('GitHub workflow configuration', () => {
  const workflowDir = path.join(process.cwd(), '.github', 'workflows');

  describe('deploy workflow', () => {
    const deployYaml = fs.readFileSync(path.join(workflowDir, 'deploy.yml'), 'utf8');

    it('targets the expected branches for push and pull_request events', () => {
      expect(deployYaml).toContain('branches: [main, office-addin-figma]');
      expect(deployYaml).toContain('pull_request:');
      expect(deployYaml).toContain('branches: [main]');
    });

    it('installs dependencies, runs quality gates, and deploys with environment variables', () => {
      expect(deployYaml).toContain('uses: actions/setup-node@v4');
      expect(deployYaml).toMatch(/node-version:\s*"18"/);
      expect(deployYaml).toContain('npm run type-check || echo "TypeScript check completed"');
      expect(deployYaml).toContain('npm run lint || echo "Linting completed"');
      expect(deployYaml).toContain('vercel deploy --token=${{ secrets.VERCEL_TOKEN }} --yes');
      expect(deployYaml).toContain('vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --yes');
    });
  });

  describe('CodeQL workflow', () => {
    const codeqlYaml = fs.readFileSync(path.join(workflowDir, 'codeql.yml'), 'utf8');

    it('initializes CodeQL with the repository configuration', () => {
      expect(codeqlYaml).toContain('uses: github/codeql-action/init@v3');
      expect(codeqlYaml).toContain('languages: ${{ matrix.language }}');
      expect(codeqlYaml).toContain('config-file: .github/codeql/codeql-config.yml');
    });
  });
});
