import { SlackIntegration } from '@/lib/integrations'

const ORIGINAL_ENV = { ...process.env }

describe('SlackIntegration', () => {
  const createResponse = (slackOk: boolean, status: number, body: Record<string, unknown> = {}) =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: jest.fn().mockResolvedValue({ ok: slackOk, ...body }),
    }) as unknown as Response

  beforeEach(() => {
    jest.restoreAllMocks()
    process.env = { ...ORIGINAL_ENV, SLACK_BOT_TOKEN: 'slack-token' }
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    jest.restoreAllMocks()
  })

  it('posts a message to Slack', async () => {
    const integration = new SlackIntegration({ retryAttempts: 1, timeoutMs: 200 })
    const message = { channel: '#finance', text: 'Quarterly report ready' }

    const response = createResponse(true, 200)

    const fetchMock = jest.fn().mockResolvedValue(response)
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await integration.postMessage(message)

    expect(fetchMock).toHaveBeenCalledWith('https://slack.com/api/chat.postMessage', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(message),
      headers: expect.objectContaining({
        Authorization: 'Bearer slack-token',
        'Content-Type': 'application/json; charset=utf-8',
      }),
    }))
    expect(result).toEqual({ ok: true, status: 200, data: { ok: true } })
  })

  it('throws when Slack returns an error payload', async () => {
    const integration = new SlackIntegration({ retryAttempts: 1, timeoutMs: 200 })
    const response = createResponse(false, 200, { error: 'channel_not_found' })

    const fetchMock = jest.fn().mockResolvedValue(response)
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await expect(integration.postMessage({ channel: '#finance', text: 'Hello' })).rejects.toThrow('Failed to send Slack message')
  })

  it('throws when token is missing', async () => {
    process.env = { ...ORIGINAL_ENV, SLACK_BOT_TOKEN: undefined }
    const integration = new SlackIntegration({ retryAttempts: 1, timeoutMs: 200 })

    await expect(integration.postMessage({ channel: '#finance', text: 'Hello' })).rejects.toThrow('Missing Slack bot token')
  })
})
