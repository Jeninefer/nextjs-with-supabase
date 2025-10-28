import fs from 'fs'
import path from 'path'

describe('package.json', () => {
  const packagePath = path.join(process.cwd(), 'package.json')
  let packageJson: any

  beforeAll(() => {
    const content = fs.readFileSync(packagePath, 'utf-8')
    packageJson = JSON.parse(content)
  })

  it('should exist and be valid JSON', () => {
    expect(packageJson).toBeDefined()
    expect(typeof packageJson).toBe('object')
  })

  describe('Scripts', () => {
    it('should have lint script using eslint', () => {
      expect(packageJson.scripts).toHaveProperty('lint')
      expect(packageJson.scripts.lint).toBe('eslint .')
    })

    it('should not use "next lint" command', () => {
      expect(packageJson.scripts.lint).not.toContain('next lint')
    })

    it('should have essential scripts', () => {
      expect(packageJson.scripts).toHaveProperty('dev')
      expect(packageJson.scripts).toHaveProperty('build')
      expect(packageJson.scripts).toHaveProperty('start')
      expect(packageJson.scripts).toHaveProperty('test')
    })

    it('should have type-check script', () => {
      expect(packageJson.scripts).toHaveProperty('type-check')
      expect(packageJson.scripts['type-check']).toContain('tsc')
    })

    it('should have format scripts', () => {
      expect(packageJson.scripts).toHaveProperty('format')
      expect(packageJson.scripts).toHaveProperty('format:check')
    })

    it('should have test scripts', () => {
      expect(packageJson.scripts).toHaveProperty('test')
      expect(packageJson.scripts).toHaveProperty('test:watch')
      expect(packageJson.scripts).toHaveProperty('test:coverage')
    })
  })

  describe('Dependencies', () => {
    it('should have Next.js as dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('next')
    })

    it('should have React as dependencies', () => {
      expect(packageJson.dependencies).toHaveProperty('react')
      expect(packageJson.dependencies).toHaveProperty('react-dom')
    })

    it('should have Supabase dependencies', () => {
      expect(packageJson.dependencies).toHaveProperty('@supabase/supabase-js')
      expect(packageJson.dependencies).toHaveProperty('@supabase/ssr')
    })

    it('should have MCP SDK', () => {
      expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk')
    })
  })

  describe('DevDependencies', () => {
    it('should have ESLint', () => {
      expect(packageJson.devDependencies).toHaveProperty('eslint')
      expect(packageJson.devDependencies).toHaveProperty('eslint-config-next')
    })

    it('should have TypeScript', () => {
      expect(packageJson.devDependencies).toHaveProperty('typescript')
    })

    it('should have testing libraries', () => {
      expect(packageJson.devDependencies).toHaveProperty('jest')
      expect(packageJson.devDependencies).toHaveProperty('@testing-library/react')
      expect(packageJson.devDependencies).toHaveProperty('@testing-library/jest-dom')
    })

    it('should have type definitions', () => {
      expect(packageJson.devDependencies).toHaveProperty('@types/node')
      expect(packageJson.devDependencies).toHaveProperty('@types/react')
    })
  })

  describe('Version requirements', () => {
    it('should specify valid version ranges', () => {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      
      Object.entries(allDeps).forEach(([pkg, version]) => {
        expect(typeof version).toBe('string')
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+.*$/)
      })
    })
  })

  describe('Metadata', () => {
    it('should have name and version', () => {
      expect(packageJson).toHaveProperty('name')
      expect(packageJson).toHaveProperty('version')
    })

    it('should be private', () => {
      expect(packageJson.private).toBe(true)
    })
  })
})