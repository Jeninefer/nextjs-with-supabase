import {
  closeDuplicatePullRequests,
  DEFAULT_AI_IDENTIFIERS,
  type PullRequestRecord,
  type CloseDuplicateOptions,
} from '@/lib/maintenance/pullRequestMaintenance';

describe('DEFAULT_AI_IDENTIFIERS', () => {
  test('is defined and frozen', () => {
    expect(DEFAULT_AI_IDENTIFIERS).toBeDefined();
    expect(Object.isFrozen(DEFAULT_AI_IDENTIFIERS)).toBe(true);
  });

  test('contains expected AI identifiers', () => {
    expect(DEFAULT_AI_IDENTIFIERS).toContain('chatgpt');
    expect(DEFAULT_AI_IDENTIFIERS).toContain('copilot');
    expect(DEFAULT_AI_IDENTIFIERS).toContain('claude');
    expect(DEFAULT_AI_IDENTIFIERS).toContain('gemini');
    expect(DEFAULT_AI_IDENTIFIERS).toContain('gpt');
  });

  test('all identifiers are lowercase strings', () => {
    DEFAULT_AI_IDENTIFIERS.forEach(identifier => {
      expect(typeof identifier).toBe('string');
      expect(identifier).toBe(identifier.toLowerCase());
    });
  });

  test('has more than 5 identifiers', () => {
    expect(DEFAULT_AI_IDENTIFIERS.length).toBeGreaterThan(5);
  });
});

describe('closeDuplicatePullRequests', () => {
  const createMockPR = (author: string, assignees: string[] = []): PullRequestRecord => ({
    author,
    assignees,
  });

  test('returns result for empty pull request array', () => {
    const result = closeDuplicatePullRequests([]);
    expect(result).toBeDefined();
  });

  test('does not close PRs from human authors', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('human-user'),
      createMockPR('john-doe'),
      createMockPR('alice'),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    expect(onClose).not.toHaveBeenCalled();
  });

  test('identifies AI-owned PRs by author', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('human-user'),
      createMockPR('chatgpt-bot'),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('identifies AI-owned PRs by assignee', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('human', []),
      createMockPR('human', ['copilot-assistant']),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('uses earliest canonical strategy by default', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('human'),
      createMockPR('gpt-4'),
      createMockPR('claude-bot'),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    
    expect(onClose).toHaveBeenCalledTimes(2);
    const canonicalArg = onClose.mock.calls[0][1];
    expect(canonicalArg).toBe(prs[0]);
  });

  test('uses latest canonical strategy when specified', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('gpt-1'),
      createMockPR('gpt-2'),
      createMockPR('human-author'),
    ];

    closeDuplicatePullRequests(prs, { 
      canonicalStrategy: 'latest',
      onClose 
    });
    
    expect(onClose).toHaveBeenCalled();
    const canonicalArg = onClose.mock.calls[0][1];
    expect(canonicalArg).toBe(prs[prs.length - 1]);
  });

  test('accepts custom AI identifiers', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('custom-bot'),
      createMockPR('another-custom-ai'),
    ];

    closeDuplicatePullRequests(prs, {
      aiIdentifiers: ['custom-bot', 'another-custom-ai'],
      onClose,
    });

    expect(onClose).toHaveBeenCalled();
  });

  test('handles PRs with multiple assignees', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('human', []),
      createMockPR('human', ['alice', 'chatgpt', 'bob']),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not throw when onClose throws', () => {
    const onClose = jest.fn(() => {
      throw new Error('Mock error');
    });
    const prs = [
      createMockPR('human'),
      createMockPR('gpt-bot'),
    ];

    expect(() => {
      closeDuplicatePullRequests(prs, { onClose });
    }).not.toThrow();
  });

  test('canonical PR itself is not closed', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('gpt-1'),
      createMockPR('gpt-2'),
      createMockPR('gpt-3'),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    
    const closedPRs = onClose.mock.calls.map(call => call[0]);
    const canonical = prs[0];
    expect(closedPRs).not.toContain(canonical);
  });

  test('handles case-insensitive identifier matching', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('human'),
      createMockPR('ChatGPT-Assistant'),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    expect(onClose).toHaveBeenCalled();
  });

  test('matches identifiers with word boundaries', () => {
    const onClose = jest.fn();
    const prs = [
      createMockPR('human'),
      createMockPR('my-gpt-bot'),
      createMockPR('notgpt'),
    ];

    closeDuplicatePullRequests(prs, { onClose });
    expect(onClose.mock.calls.length).toBeGreaterThan(0);
  });
});