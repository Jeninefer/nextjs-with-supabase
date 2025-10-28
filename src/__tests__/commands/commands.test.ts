import * as Office from 'office-js'

vi.mock('office-js', async () => {
    const actual = await vi.importActual('office-js')
    return {
        ...actual,
        actions: {
            ...actual.actions,
            associate: vi.fn(),
            // Add other action methods if needed
        }
    }
})

describe('Action Association', () => {
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
        expect(Office.context?.mailbox?.item?.notificationMessages?.replaceAsync).toHaveBeenCalledWith(
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