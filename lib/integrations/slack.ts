import { Integration, IntegrationError, IntegrationOptions } from './base'

export interface SlackMessage {
  channel: string
  text: string
  blocks?: unknown[]
  attachments?: unknown[]
}

interface SlackResponse<T = unknown> {
  ok: boolean
  status: number
  data: T
}

export class SlackIntegration extends Integration {
  private readonly baseUrl: string
  private readonly token: string | undefined

  constructor(options: IntegrationOptions = {}) {
    super(options)
    this.baseUrl = 'https://slack.com/api'
    this.token = process.env.SLACK_BOT_TOKEN
  }

  async postMessage(message: SlackMessage): Promise<SlackResponse> {
    return this.executeWithRateLimit(async () => {
      const response = await this.fetchWithAuth('chat.postMessage', {
        method: 'POST',
        body: JSON.stringify(message),
      })

      const payload = await response.json().catch(() => undefined)

      if (!response.ok || !payload?.ok) {
        throw new IntegrationError('Failed to send Slack message', payload)
      }

      return {
        ok: true,
        status: response.status,
        data: payload,
      }
    })
  }

  private async fetchWithAuth(path: string, init: RequestInit): Promise<Response> {
    if (!this.token) {
      throw new IntegrationError('Missing Slack bot token')
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json; charset=utf-8',
      ...init.headers,
    }

    return fetch(`${this.baseUrl}/${path}`, {
      ...init,
      headers,
    })
  }
}
