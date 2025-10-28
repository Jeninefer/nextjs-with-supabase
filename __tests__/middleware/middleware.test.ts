import { middleware, config } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Mock Supabase SSR
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn((options) => ({
        cookies: {
          set: jest.fn(),
          delete: jest.fn(),
        },
        headers: new Headers(options?.request?.headers || {}),
      })),
    },
  };
});

describe('Middleware', () => {
  let mockRequest: NextRequest;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env;
    
    mockRequest = {
      cookies: {
        get: jest.fn((name: string) => ({ name, value: 'mock-cookie-value' })),
      },
      headers: new Headers(),
    } as unknown as NextRequest;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('returns NextResponse when Supabase env vars are not set', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await middleware(mockRequest);
    expect(response).toBeDefined();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  test('creates Supabase client when env vars are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);

    const response = await middleware(mockRequest);

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        }),
      })
    );
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
  });

  test('handles Supabase auth error gracefully', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockRejectedValue(new Error('Auth failed')),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const response = await middleware(mockRequest);

    expect(response).toBeDefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Supabase middleware auth check failed',
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  test('cookie handlers work correctly', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    let capturedCookieHandlers: any;
    (createServerClient as jest.Mock).mockImplementation((url, key, options) => {
      capturedCookieHandlers = options.cookies;
      return {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };
    });

    await middleware(mockRequest);

    expect(capturedCookieHandlers).toBeDefined();
    expect(typeof capturedCookieHandlers.get).toBe('function');
    expect(typeof capturedCookieHandlers.set).toBe('function');
    expect(typeof capturedCookieHandlers.remove).toBe('function');
  });

  test('get cookie handler retrieves cookie value', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    let capturedCookieHandlers: any;
    (createServerClient as jest.Mock).mockImplementation((url, key, options) => {
      capturedCookieHandlers = options.cookies;
      return {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };
    });

    await middleware(mockRequest);

    const cookieValue = capturedCookieHandlers.get('test-cookie');
    expect(mockRequest.cookies.get).toHaveBeenCalledWith('test-cookie');
    expect(cookieValue).toBe('mock-cookie-value');
  });
});

describe('Middleware config', () => {
  test('has correct matcher pattern', () => {
    expect(config).toHaveProperty('matcher');
    expect(Array.isArray(config.matcher)).toBe(true);
  });

  test('matcher excludes static assets', () => {
    const matcher = config.matcher[0];
    expect(matcher).toContain('_next/static');
    expect(matcher).toContain('_next/image');
    expect(matcher).toContain('favicon.ico');
  });

  test('matcher excludes common image extensions', () => {
    const matcher = config.matcher[0];
    expect(matcher).toContain('svg');
    expect(matcher).toContain('png');
    expect(matcher).toContain('jpg');
    expect(matcher).toContain('jpeg');
    expect(matcher).toContain('gif');
    expect(matcher).toContain('webp');
  });
});