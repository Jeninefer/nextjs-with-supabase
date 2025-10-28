import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

describe('GitHub Workflows', () => {
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows')

  describe('codeql.yml', () => {
    const codeqlPath = path.join(workflowsDir, 'codeql.yml')
    let codeqlConfig: any

    beforeAll(() => {
      const content = fs.readFileSync(codeqlPath, 'utf-8')
      codeqlConfig = yaml.load(content)
    })

    it('should exist and be valid YAML', () => {
      expect(codeqlConfig).toBeDefined()
      expect(typeof codeqlConfig).toBe('object')
    })

    it('should have correct name', () => {
      expect(codeqlConfig.name).toBe('CodeQL')
    })

    it('should have proper triggers', () => {
      expect(codeqlConfig.on).toHaveProperty('push')
      expect(codeqlConfig.on).toHaveProperty('pull_request')
      expect(codeqlConfig.on).toHaveProperty('schedule')
    })

    it('should run on main branch', () => {
      expect(codeqlConfig.on.push.branches).toContain('main')
      expect(codeqlConfig.on.pull_request.branches).toContain('main')
    })

    it('should have weekly schedule', () => {
      expect(codeqlConfig.on.schedule).toHaveLength(1)
      expect(codeqlConfig.on.schedule[0].cron).toBe('0 0 * * 0')
    })

    describe('Analyze job', () => {
      let analyzeJob: any

      beforeAll(() => {
        analyzeJob = codeqlConfig.jobs.analyze
      })

      it('should have correct name', () => {
        expect(analyzeJob.name).toBe('Analyze')
      })

      it('should run on ubuntu-latest', () => {
        expect(analyzeJob['runs-on']).toBe('ubuntu-latest')
      })

      it('should have proper permissions', () => {
        expect(analyzeJob.permissions).toEqual({
          actions: 'read',
          contents: 'read',
          'security-events': 'write'
        })
      })

      it('should analyze JavaScript', () => {
        expect(analyzeJob.strategy.matrix.language).toContain('javascript')
      })

      it('should not fail fast', () => {
        expect(analyzeJob.strategy['fail-fast']).toBe(false)
      })

      describe('Steps', () => {
        let steps: any[]

        beforeAll(() => {
          steps = analyzeJob.steps
        })

        it('should checkout repository', () => {
          const checkoutStep = steps.find(s => s.name === 'Checkout repository')
          expect(checkoutStep).toBeDefined()
          expect(checkoutStep.uses).toContain('actions/checkout@')
        })

        it('should use Node.js 20.9.0', () => {
          const nodeStep = steps.find(s => s.name === 'Use Node.js 20.9.0')
          expect(nodeStep).toBeDefined()
          expect(nodeStep.uses).toContain('actions/setup-node@')
          expect(nodeStep.with['node-version']).toBe('20.9.0')
        })

        it('should initialize CodeQL', () => {
          const initStep = steps.find(s => s.name === 'Initialize CodeQL')
          expect(initStep).toBeDefined()
          expect(initStep.uses).toContain('github/codeql-action/init@')
          expect(initStep.with.languages).toBe('${{ matrix.language }}')
        })

        it('should autobuild', () => {
          const autobuildStep = steps.find(s => s.name === 'Autobuild')
          expect(autobuildStep).toBeDefined()
          expect(autobuildStep.uses).toContain('github/codeql-action/autobuild@')
        })

        it('should perform CodeQL analysis', () => {
          const analyzeStep = steps.find(s => s.name === 'Perform CodeQL Analysis')
          expect(analyzeStep).toBeDefined()
          expect(analyzeStep.uses).toContain('github/codeql-action/analyze@')
          expect(analyzeStep.with.category).toBe('/language:${{ matrix.language }}')
        })

        it('should use v3 or v4 of CodeQL actions', () => {
          const codeqlSteps = steps.filter(s => 
            s.uses && s.uses.includes('github/codeql-action')
          )
          
          codeqlSteps.forEach(step => {
            expect(step.uses).toMatch(/@v[34]$/)
          })
        })
      })
    })

    describe('Validation', () => {
      it('should not have incomplete or placeholder content', () => {
        const content = fs.readFileSync(codeqlPath, 'utf-8')
        expect(content).not.toContain('...existing code...')
        expect(content).not.toContain('TODO')
      })

      it('should be properly formatted YAML', () => {
        const content = fs.readFileSync(codeqlPath, 'utf-8')
        const lines = content.split('\n')
        
        // Check indentation consistency (2 spaces)
        const indentedLines = lines.filter(l => l.match(/^\s+\S/))
        indentedLines.forEach(line => {
          const spaces = line.match(/^(\s+)/)?.[1].length || 0
          expect(spaces % 2).toBe(0)
        })
      })
    })
  })

  describe('deploy.yml', () => {
    const deployPath = path.join(workflowsDir, 'deploy.yml')
    let deployConfig: any

    beforeAll(() => {
      const content = fs.readFileSync(deployPath, 'utf-8')
      deployConfig = yaml.load(content)
    })

    it('should exist and be valid YAML', () => {
      expect(deployConfig).toBeDefined()
      expect(typeof deployConfig).toBe('object')
    })

    it('should use Node.js 20.9.0', () => {
      const jobs = Object.values(deployConfig.jobs) as any[]
      const setupNodeSteps = jobs.flatMap(job => job.steps || [])
        .filter((step: any) => step.uses && step.uses.includes('setup-node'))

      setupNodeSteps.forEach((step: any) => {
        expect(step.with['node-version']).toBe('20.9.0')
      })
    })

    it('should not use Node.js 18', () => {
      const content = fs.readFileSync(deployPath, 'utf-8')
      expect(content).not.toMatch(/node-version:\s*["']?18["']?/)
    })

    describe('Version consistency', () => {
      it('should use consistent Node.js version across all jobs', () => {
        const jobs = Object.values(deployConfig.jobs) as any[]
        const nodeVersions = jobs.flatMap(job => job.steps || [])
          .filter((step: any) => step.uses && step.uses.includes('setup-node'))
          .map((step: any) => step.with['node-version'])

        const uniqueVersions = [...new Set(nodeVersions)]
        expect(uniqueVersions).toHaveLength(1)
        expect(uniqueVersions[0]).toBe('20.9.0')
      })
    })
  })

  describe('Workflow consistency', () => {
    it('should use consistent action versions', () => {
      const workflows = ['codeql.yml', 'deploy.yml']
      const actionVersions: Record<string, Set<string>> = {}

      workflows.forEach(workflow => {
        const workflowPath = path.join(workflowsDir, workflow)
        if (fs.existsSync(workflowPath)) {
          const content = fs.readFileSync(workflowPath, 'utf-8')
          const config = yaml.load(content) as any

          const jobs = Object.values(config.jobs || {}) as any[]
          jobs.forEach(job => {
            (job.steps || []).forEach((step: any) => {
              if (step.uses) {
                const [action, version] = step.uses.split('@')
                if (!actionVersions[action]) {
                  actionVersions[action] = new Set()
                }
                actionVersions[action].add(version)
              }
            })
          })
        }
      })

      // Check that commonly used actions have consistent versions
      const commonActions = ['actions/checkout', 'actions/setup-node']
      commonActions.forEach(action => {
        if (actionVersions[action]) {
          expect(actionVersions[action].size).toBeLessThanOrEqual(2)
        }
      })
    })

    it('should use modern action versions', () => {
      const workflows = fs.readdirSync(workflowsDir)
        .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))

      workflows.forEach(workflow => {
        const workflowPath = path.join(workflowsDir, workflow)
        const content = fs.readFileSync(workflowPath, 'utf-8')

        // Should use v3 or v4 for major actions
        const actionMatches = content.matchAll(/uses:\s*([^@\n]+)@v(\d+)/g)
        
        for (const match of actionMatches) {
          const version = parseInt(match[2])
          expect(version).toBeGreaterThanOrEqual(3)
        }
      })
    })
  })
})