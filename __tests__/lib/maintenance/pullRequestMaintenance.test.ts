import {
  DEFAULT_AI_IDENTIFIERS,
  closeDuplicatePullRequests,
  type PullRequestRecord
} from '@/lib/maintenance/pullRequestMaintenance';

describe('closeDuplicatePullRequests', () => {
  it('treats the first pull request as canonical by default and invokes onClose for duplicates', () => {
    const canonical: PullRequestRecord = { author: 'maintainer', assignees: [] };
    const aiAuthor: PullRequestRecord = { author: 'ChatGPT Helper', assignees: [] };
    const aiAssignee: PullRequestRecord = { author: 'contributor', assignees: ['GitHub Copilot'] };

    const onClose = jest.fn();

    const result = closeDuplicatePullRequests([
      canonical,
      aiAuthor,
      aiAssignee
    ], { onClose });

    expect(result).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenNthCalledWith(1, aiAuthor, canonical);
    expect(onClose).toHaveBeenNthCalledWith(2, aiAssignee, canonical);
  });

  it('supports selecting the latest pull request as canonical and escapes custom identifiers', () => {
    const first: PullRequestRecord = { author: 'Alice', assignees: [] };
    const second: PullRequestRecord = { author: 'C++Bot', assignees: [] };
    const third: PullRequestRecord = { author: 'Reviewer', assignees: ['c++bot'] };

    const onClose = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('transient failure');
      })
      .mockImplementation(() => undefined);

    closeDuplicatePullRequests([first, second, third], {
      canonicalStrategy: 'latest',
      aiIdentifiers: ['c++bot'],
      onClose
    });

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenNthCalledWith(1, first, third);
    expect(onClose).toHaveBeenNthCalledWith(2, second, third);
  });
});

describe('DEFAULT_AI_IDENTIFIERS', () => {
  it('provides a frozen list of common AI related account names', () => {
    expect(Array.isArray(DEFAULT_AI_IDENTIFIERS)).toBe(true);
    expect(DEFAULT_AI_IDENTIFIERS).toContain('chatgpt');
    expect(Object.isFrozen(DEFAULT_AI_IDENTIFIERS)).toBe(true);
  });
});
