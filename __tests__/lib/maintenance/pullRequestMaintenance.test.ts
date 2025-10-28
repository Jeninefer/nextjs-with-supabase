import {
  DEFAULT_AI_IDENTIFIERS,
  closeDuplicatePullRequests,
  type PullRequestRecord,
  type CloseDuplicateOptions
} from '@/lib/maintenance/pullRequestMaintenance'

describe('pullRequestMaintenance', () => {
  describe('DEFAULT_AI_IDENTIFIERS', () => {
    it('should be a frozen readonly array', () => {
      expect(Object.isFrozen(DEFAULT_AI_IDENTIFIERS)).toBe(true)
    })

    it('should contain common AI tool identifiers', () => {
      const expectedIdentifiers = [
        'chatgpt',
        'openai',
        'copilot',
        'cursor',
        'claude',
        'gemini',
        'codeium',
        'gpt',
        'aider',
        'swe-agent',
        'blackbox',
        'cody',
        'tabnine'
      ]

      expectedIdentifiers.forEach(identifier => {
        expect(DEFAULT_AI_IDENTIFIERS).toContain(identifier)
      })
    })

    it('should not be modifiable', () => {
      expect(() => {
        (DEFAULT_AI_IDENTIFIERS as any).push('new-ai')
      }).toThrow()
    })

    it('should contain only lowercase identifiers', () => {
      DEFAULT_AI_IDENTIFIERS.forEach(identifier => {
        expect(identifier).toBe(identifier.toLowerCase())
      })
    })

    it('should not contain duplicates', () => {
      const uniqueIdentifiers = new Set(DEFAULT_AI_IDENTIFIERS)
      expect(uniqueIdentifiers.size).toBe(DEFAULT_AI_IDENTIFIERS.length)
    })
  })

  describe('closeDuplicatePullRequests', () => {
    describe('AI ownership detection', () => {
      it('should identify PR with AI author', () => {
        const prs: PullRequestRecord[] = [
          { author: 'ChatGPT-Bot', assignees: [] },
          { author: 'human-developer', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Should close the AI-owned PR (second one, since first is canonical)
        expect(onCloseMock).toHaveBeenCalledTimes(0) // First is canonical, no duplicates
      })

      it('should identify PR with AI assignee', () => {
        const prs: PullRequestRecord[] = [
          { author: 'human-developer', assignees: ['copilot-bot'] },
          { author: 'human-developer', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        expect(onCloseMock).toHaveBeenCalledTimes(0) // First is canonical
      })

      it('should detect AI identifiers with case insensitivity', () => {
        const prs: PullRequestRecord[] = [
          { author: 'CHATGPT', assignees: [] },
          { author: 'ChatGpt', assignees: [] },
          { author: 'chatgpt', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // First is canonical, others should be checked as duplicates
        expect(onCloseMock).toHaveBeenCalledTimes(2)
      })

      it('should detect AI identifiers with Unicode boundaries', () => {
        const prs: PullRequestRecord[] = [
          { author: 'user-copilot-bot', assignees: [] },
          { author: 'copilot', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        expect(onCloseMock).toHaveBeenCalledTimes(1)
      })

      it('should not match partial words', () => {
        const prs: PullRequestRecord[] = [
          { author: 'developer', assignees: [] }, // Contains 'copilot' substring? No
          { author: 'helicopter', assignees: [] } // Contains 'copilot' substring? No
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Neither should be identified as AI-owned
        expect(onCloseMock).toHaveBeenCalledTimes(0)
      })

      it('should match AI identifiers at word boundaries', () => {
        const prs: PullRequestRecord[] = [
          { author: 'gpt-4-bot', assignees: [] },
          { author: 'bot-gpt', assignees: [] },
          { author: 'gpt', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // All contain 'gpt' at word boundaries
        expect(onCloseMock).toHaveBeenCalledTimes(2) // First is canonical
      })
    })

    describe('Canonical selection strategy', () => {
      it('should use earliest PR as canonical by default', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] }, // Should be canonical
          { author: 'chatgpt', assignees: [] },
          { author: 'claude', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Should close PRs 2 and 3, with PR 1 as canonical
        expect(onCloseMock).toHaveBeenCalledWith(prs[1], prs[0])
        expect(onCloseMock).toHaveBeenCalledWith(prs[2], prs[0])
      })

      it('should use latest PR as canonical when specified', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] },
          { author: 'chatgpt', assignees: [] },
          { author: 'claude', assignees: [] } // Should be canonical
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          canonicalStrategy: 'latest',
          onClose: onCloseMock
        })

        // Should close PRs 1 and 2, with PR 3 as canonical
        expect(onCloseMock).toHaveBeenCalledWith(prs[0], prs[2])
        expect(onCloseMock).toHaveBeenCalledWith(prs[1], prs[2])
      })

      it('should not close canonical PR', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] } // Canonical, should not be closed
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        expect(onCloseMock).not.toHaveBeenCalled()
      })
    })

    describe('Custom AI identifiers', () => {
      it('should accept custom AI identifiers', () => {
        const prs: PullRequestRecord[] = [
          { author: 'custom-ai-bot', assignees: [] },
          { author: 'another-custom-ai', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          aiIdentifiers: ['custom-ai-bot', 'another-custom-ai'],
          onClose: onCloseMock
        })

        expect(onCloseMock).toHaveBeenCalledTimes(1)
      })

      it('should override default identifiers when custom ones provided', () => {
        const prs: PullRequestRecord[] = [
          { author: 'chatgpt', assignees: [] }, // Not in custom list
          { author: 'my-bot', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          aiIdentifiers: ['my-bot'],
          onClose: onCloseMock
        })

        // Only my-bot should be considered AI-owned
        expect(onCloseMock).toHaveBeenCalledTimes(1)
      })

      it('should handle empty custom identifiers', () => {
        const prs: PullRequestRecord[] = [
          { author: 'chatgpt', assignees: [] },
          { author: 'copilot', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          aiIdentifiers: [],
          onClose: onCloseMock
        })

        // No AI identifiers, so nothing should be closed
        expect(onCloseMock).not.toHaveBeenCalled()
      })
    })

    describe('Non-AI PR handling', () => {
      it('should not close non-AI-owned PRs', () => {
        const prs: PullRequestRecord[] = [
          { author: 'human-developer-1', assignees: [] },
          { author: 'human-developer-2', assignees: [] },
          { author: 'human-developer-3', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // None are AI-owned, so nothing should be closed
        expect(onCloseMock).not.toHaveBeenCalled()
      })

      it('should skip non-AI PRs even when mixed with AI PRs', () => {
        const prs: PullRequestRecord[] = [
          { author: 'human-developer', assignees: [] }, // Canonical
          { author: 'chatgpt', assignees: [] }, // AI - should be closed
          { author: 'another-human', assignees: [] }, // Human - should be skipped
          { author: 'copilot', assignees: [] } // AI - should be closed
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Should only close AI-owned PRs (indices 1 and 3)
        expect(onCloseMock).toHaveBeenCalledTimes(2)
        expect(onCloseMock).toHaveBeenCalledWith(prs[1], prs[0])
        expect(onCloseMock).toHaveBeenCalledWith(prs[3], prs[0])
      })
    })

    describe('onClose callback', () => {
      it('should call onClose for each duplicate AI PR', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] },
          { author: 'chatgpt', assignees: [] },
          { author: 'claude', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        expect(onCloseMock).toHaveBeenCalledTimes(2)
      })

      it('should pass duplicate and canonical PRs to onClose', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] },
          { author: 'chatgpt', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        expect(onCloseMock).toHaveBeenCalledWith(prs[1], prs[0])
      })

      it('should handle onClose errors gracefully', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] },
          { author: 'chatgpt', assignees: [] },
          { author: 'claude', assignees: [] }
        ]

        const onCloseMock = jest.fn()
          .mockImplementationOnce(() => { throw new Error('Close failed') })
          .mockImplementationOnce(() => { /* success */ })

        // Should not throw
        expect(() => {
          closeDuplicatePullRequests(prs, {
            onClose: onCloseMock
          })
        }).not.toThrow()

        // Should still attempt all closures
        expect(onCloseMock).toHaveBeenCalledTimes(2)
      })

      it('should work without onClose callback', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] },
          { author: 'chatgpt', assignees: [] }
        ]

        // Should not throw when onClose is undefined
        expect(() => {
          closeDuplicatePullRequests(prs)
        }).not.toThrow()
      })
    })

    describe('Edge cases', () => {
      it('should handle empty PR array', () => {
        const onCloseMock = jest.fn()

        closeDuplicatePullRequests([], {
          onClose: onCloseMock
        })

        expect(onCloseMock).not.toHaveBeenCalled()
      })

      it('should handle single PR', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Single PR is canonical, nothing to close
        expect(onCloseMock).not.toHaveBeenCalled()
      })

      it('should handle PRs with multiple assignees', () => {
        const prs: PullRequestRecord[] = [
          { author: 'human', assignees: ['dev1', 'copilot', 'dev2'] },
          { author: 'human2', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // First PR has AI assignee, but it's canonical, so nothing to close
        expect(onCloseMock).not.toHaveBeenCalled()
      })

      it('should handle whitespace in author/assignee names', () => {
        const prs: PullRequestRecord[] = [
          { author: '  copilot  ', assignees: [] },
          { author: '\tchatgpt\n', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Should trim and match AI identifiers
        expect(onCloseMock).toHaveBeenCalledTimes(1)
      })

      it('should handle special characters in names', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot-bot-v2.0', assignees: [] },
          { author: '[ChatGPT]', assignees: [] },
          { author: 'claude@ai.com', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // All should be identified as AI-owned
        expect(onCloseMock).toHaveBeenCalledTimes(2)
      })

      it('should handle Unicode in author names', () => {
        const prs: PullRequestRecord[] = [
          { author: '开发者-copilot', assignees: [] },
          { author: 'ユーザー-chatgpt', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Should detect AI identifiers with Unicode boundaries
        expect(onCloseMock).toHaveBeenCalledTimes(1)
      })

      it('should return null as stub result', () => {
        const result = closeDuplicatePullRequests([])

        expect(result).toBe(null)
      })
    })

    describe('Complex scenarios', () => {
      it('should handle large number of PRs efficiently', () => {
        const prs: PullRequestRecord[] = Array.from({ length: 1000 }, (_, i) => ({
          author: i % 2 === 0 ? 'copilot' : 'human',
          assignees: []
        }))

        const onCloseMock = jest.fn()

        const startTime = Date.now()
        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })
        const duration = Date.now() - startTime

        // Should complete in reasonable time (< 1 second)
        expect(duration).toBeLessThan(1000)
        
        // Should close all AI PRs except first (canonical)
        expect(onCloseMock).toHaveBeenCalledTimes(499)
      })

      it('should handle all PRs being AI-owned', () => {
        const prs: PullRequestRecord[] = [
          { author: 'copilot', assignees: [] },
          { author: 'chatgpt', assignees: [] },
          { author: 'claude', assignees: [] },
          { author: 'gemini', assignees: [] }
        ]

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Should close all except canonical
        expect(onCloseMock).toHaveBeenCalledTimes(3)
      })

      it('should work with all identifiers in DEFAULT_AI_IDENTIFIERS', () => {
        const prs: PullRequestRecord[] = DEFAULT_AI_IDENTIFIERS.map(identifier => ({
          author: identifier,
          assignees: []
        }))

        const onCloseMock = jest.fn()

        closeDuplicatePullRequests(prs, {
          onClose: onCloseMock
        })

        // Should close all except canonical (first)
        expect(onCloseMock).toHaveBeenCalledTimes(DEFAULT_AI_IDENTIFIERS.length - 1)
      })
    })
  })
})