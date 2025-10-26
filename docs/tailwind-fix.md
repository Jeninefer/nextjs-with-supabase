# Tailwind CSS Configuration Fix

## Issue
The Tailwind CSS VSCode extension was failing with the error:
```
Error: Can't resolve 'tailwindcss/lib/util/flattenColorPalette'
```

This error occurred because the `tailwind.config.ts` file was using `require()` to import an internal Tailwind CSS utility:
```typescript
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");
```

## Problem
- Internal Tailwind CSS modules (like `lib/util/flattenColorPalette`) are not part of the public API
- The VSCode Tailwind CSS extension has trouble resolving these internal module paths
- Using `require()` in TypeScript configuration files can cause module resolution issues

## Solution
Replaced the external dependency with an inline implementation of the `flattenColorPalette` function:

```typescript
// Type-safe color object type, matching the implementation in tailwind.config.ts
type ColorObject = Record<string, string | ColorObject>;

/**
 * Flattens a nested color object into a flat Record<string, string> suitable for Tailwind CSS.
 * @param colors - The nested color object to flatten.
 * @returns A flat object mapping color keys to color values.
 */
function flattenColorPalette(colors: ColorObject): Record<string, string> {
  const result: Record<string, string> = {};
  
  /**
   * Recursively flattens the color object into the result object.
   * @param obj - The current color object to flatten.
   * @param prefix - The prefix for nested keys.
   * @returns void
   */
  function flatten(obj: ColorObject, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const colorKey = prefix ? `${prefix}-${key}` : key;
        result[key === 'DEFAULT' && prefix ? prefix : colorKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        flatten(value, prefix ? `${prefix}-${key}` : key);
      }
    }
  }
  
  flatten(colors);
  return result;
}
```

## Benefits
1. **No external dependencies**: Doesn't rely on internal Tailwind CSS modules
2. **VSCode compatibility**: The extension can now properly parse the configuration
3. **Maintainability**: Less likely to break with Tailwind CSS updates
4. **Type safety**: Properly typed with TypeScript

## Testing
The fix has been verified to:
- ✓ Load the Tailwind configuration successfully
- ✓ Generate CSS variables correctly for all color definitions
- ✓ Compile Tailwind CSS without errors
- ✓ Maintain all existing functionality

## Usage
The configuration continues to work exactly as before. All ABACO color definitions and custom utilities are preserved and function correctly.
