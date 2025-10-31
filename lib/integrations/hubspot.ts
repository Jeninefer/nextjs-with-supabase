import { Integration, IntegrationError, IntegrationOptions } from './base'

interface HubSpotRequestInit extends RequestInit {
  body?: string
}

export interface HubSpotContactPayload {
  properties: Record<string, string | number | boolean | null>
}

export interface HubSpotCustomEventPayload {
  eventName: string
  properties?: Record<string, unknown>
}

export interface HubSpotResponse<T = unknown> {
  status: number
  data: T
}

export class HubSpotIntegration extends Integration {
  private readonly baseUrl: string
  private readonly token: string | undefined

  constructor(options: IntegrationOptions = {}) {
    super(options)
    this.baseUrl = 'https://api.hubapi.com'
    this.token = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  }

  async upsertContact(payload: HubSpotContactPayload): Promise<HubSpotResponse> {
    return this.executeWithRateLimit(async () => {
      const response = await this.fetchWithAuth(
        '/crm/v3/objects/contacts',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new IntegrationError('Failed to upsert HubSpot contact', await response.json().catch(() => undefined))
      }

      return this.parseResponse(response)
    })
  }

  async sendCustomEvent(payload: HubSpotCustomEventPayload): Promise<HubSpotResponse> {
    return this.executeWithRateLimit(async () => {
      const response = await this.fetchWithAuth(
        '/events/v3/send',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new IntegrationError('Failed to send HubSpot event', await response.json().catch(() => undefined))
      }

      return this.parseResponse(response)
    })
  }

  private async fetchWithAuth(path: string, init: HubSpotRequestInit): Promise<Response> {
    if (!this.token) {
      throw new IntegrationError('Missing HubSpot private app token')
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init.headers,
    }

    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    })
  }

  private async parseResponse<T>(response: Response): Promise<HubSpotResponse<T>> {
    const data = await response.json().catch(() => undefined)
    return {
      status: response.status,
      data: data as T,
    }
  }
}
