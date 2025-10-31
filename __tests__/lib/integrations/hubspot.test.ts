import { HubSpotIntegration } from '@/lib/integrations'

const ORIGINAL_ENV = { ...process.env }

describe('HubSpotIntegration', () => {
  const createResponse = (ok: boolean, status: number, body: unknown) =>
    ({
      ok,
      status,
      json: jest.fn().mockResolvedValue(body),
    }) as unknown as Response

  beforeEach(() => {
    jest.restoreAllMocks()
    process.env = { ...ORIGINAL_ENV, HUBSPOT_PRIVATE_APP_TOKEN: 'test-token' }
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    jest.restoreAllMocks()
  })

  it('sends contact payload to HubSpot', async () => {
    const integration = new HubSpotIntegration({ retryAttempts: 1, timeoutMs: 200 })
    const payload = { properties: { email: 'user@example.com' } }

    const response = createResponse(true, 201, { id: '123' })

    const fetchMock = jest.fn().mockResolvedValue(response)
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await integration.upsertContact(payload)

    expect(fetchMock).toHaveBeenCalledWith('https://api.hubapi.com/crm/v3/objects/contacts', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
      headers: expect.objectContaining({
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    }))
    expect(result).toEqual({ status: 201, data: { id: '123' } })
  })

  it('throws when the HubSpot API responds with an error', async () => {
    const integration = new HubSpotIntegration({ retryAttempts: 1, timeoutMs: 200 })
    const payload = { properties: { email: 'user@example.com' } }

    const errorResponse = createResponse(false, 400, { message: 'error' })

    const fetchMock = jest.fn().mockResolvedValue(errorResponse)
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await expect(integration.upsertContact(payload)).rejects.toThrow('Failed to upsert HubSpot contact')
  })

  it('throws when token is missing', async () => {
    process.env = { ...ORIGINAL_ENV, HUBSPOT_PRIVATE_APP_TOKEN: undefined }
    const integration = new HubSpotIntegration({ retryAttempts: 1, timeoutMs: 200 })

    await expect(integration.upsertContact({ properties: {} })).rejects.toThrow('Missing HubSpot private app token')
  })
})
