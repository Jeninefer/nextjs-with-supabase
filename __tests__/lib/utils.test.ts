import { cn } from '@/lib/utils'

describe('cn utility function', () => {
    test('cn function merges classes', () => {
        const result = cn('class1', 'class2', 'class3')
        expect(result).toBe('class1 class2 class3')
    })

    test('cn handles empty inputs', () => {
        const result = cn()
        expect(result).toBe('')
    })

    test('cn handles conditional classes', () => {
        const result = cn('base-class', false && 'conditional-class', 'always-present')
        expect(result).toBe('base-class always-present')
    })

    test('cn handles undefined and null values', () => {
        const result = cn('class1', null, undefined, 'class2')
        expect(result).toBe('class1 class2')
    })

    test('cn merges Tailwind classes correctly', () => {
        // twMerge should handle conflicting Tailwind classes
        const result = cn('px-2 py-1', 'px-4')
        expect(result).toBe('py-1 px-4')
    })

    test('cn handles array of classes', () => {
        const result = cn(['class1', 'class2'], 'class3')
        expect(result).toBe('class1 class2 class3')
    })

    test('cn handles object with conditional classes', () => {
        const result = cn({
            'class1': true,
            'class2': false,
            'class3': true
        })
        expect(result).toBe('class1 class3')
    })
})