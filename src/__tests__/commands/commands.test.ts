import { describe, it, expect, vi, beforeEach } from 'vitest'

declare global {
  // eslint-disable-next-line no-var
  var Office: any
}

describe('Office add-in command action registration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    globalThis.Office = {
      MailboxEnums: { ItemNotificationMessageType: { InformationalMessage: 'InformationalMessage' } },
      context: {
        mailbox: {
          item: {
            notificationMessages: {
              replaceAsync: vi.fn()
            }
          }
        }
      },
      actions: { associate: vi.fn() },
      onReady: vi.fn((cb?: Function) => cb && cb())
    }
  })

  it('associates "action" and shows notification then completes', async () => {
    let captured: Function | null = null
    Office.actions.associate.mockImplementation((name: string, fn: Function) => {
      if (name === 'action') captured = fn
    })

    await import('../../commands/commands.js')
    expect(Office.actions.associate).toHaveBeenCalledWith('action', expect.any(Function))
    expect(typeof captured).toBe('function')

    const event = { completed: vi.fn() }
    await (captured as Function)(event)
    expect(Office.context.mailbox.item.notificationMessages.replaceAsync).toHaveBeenCalledWith(
      'ActionPerformanceNotification',
      expect.objectContaining({
        type: 'InformationalMessage',
        message: expect.any(String),
        icon: 'Icon.80x80',
        persistent: true
      })
    )
    expect(event.completed).toHaveBeenCalled()
  })
})