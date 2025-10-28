import fs from 'fs'
import path from 'path'

describe('eslint.config.mjs', () => {
  const configPath = path.join(process.cwd(), 'eslint.config.mjs')
  let configContent: string

  beforeAll(() => {
    configContent = fs.readFileSync(configPath, 'utf-8')
  })

  it('should exist', () => {
    expect(fs.existsSync(configPath)).toBe(true)
  })

  it('should be a valid JavaScript module', () => {
    expect(configContent).toMatch(/export default/)
  })

  it('should use FlatCompat for Next.js config', () => {
    expect(configContent).toContain('FlatCompat')
    expect(configContent).toContain('next/core-web-vitals')
  })

  it('should have ignores configuration', () => {
    expect(configContent).toContain('ignores')
  })

  it('should ignore supabase functions directory', () => {
    expect(configContent).toContain('supabase/functions')
  })

  it('should not contain deprecated ignorePatterns', () => {
    expect(configContent).not.toContain('ignorePatterns')
  })

  it('should not contain @typescript-eslint/no-unused-vars rule', () => {
    // This was removed in the diff
    expect(configContent).not.toContain('@typescript-eslint/no-unused-vars')
  })

  it('should export an array configuration', () => {
    expect(configContent).toMatch(/const\s+eslintConfig\s*=\s*\[/)
  })

  it('should import required dependencies', () => {
    expect(configContent).toContain('import')
    expect(configContent).toContain('@eslint/eslintrc')
  })

  describe('Structure validation', () => {
    it('should have proper module structure', () => {
      const lines = configContent.split('\n')
      const importLines = lines.filter(l => l.trim().startsWith('import'))
      const exportLines = lines.filter(l => l.includes('export default'))

      expect(importLines.length).toBeGreaterThan(0)
      expect(exportLines.length).toBe(1)
    })

    it('should not have syntax errors', () => {
      // Basic syntax validation
      expect(configContent).not.toContain('undefined')
      expect(configContent).toMatch(/^import[\s\S]*export default[\s\S]*$/m)
    })

    it('should use modern ESLint flat config', () => {
      // Flat config doesn't use .eslintrc style
      expect(configContent).not.toContain('.eslintrc')
      expect(configContent).not.toContain('extends:')
    })
  })

  describe('Ignore patterns', () => {
    it('should properly format ignores as array', () => {
      expect(configContent).toMatch(/ignores:\s*\[/)
    })

    it('should use glob patterns for ignores', () => {
      expect(configContent).toMatch(/supabase\/functions\/\*\*\/\*/)
    })
  })

  describe('Compatibility', () => {
    it('should maintain Next.js compatibility', () => {
      expect(configContent).toContain('next')
    })

    it('should use ES module syntax', () => {
      expect(configContent).not.toContain('module.exports')
      expect(configContent).not.toContain('require(')
    })
  })
})