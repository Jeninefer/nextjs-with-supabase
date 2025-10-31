import type { NextRequest } from 'next/server';

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({ auth: {} }))
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ mocked: true }))
  }
}));

describe('middleware', () => {
  const { createServerClient } = jest.requireMock('@supabase/ssr');
  const mockedNextResponse = jest.requireMock('next/server').NextResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  it('creates a Supabase client with request cookies and returns the Next.js response', async () => {
    const { middleware } = await import('@/middleware');

    const request = { headers: new Map() } as unknown as NextRequest;
    const response = await middleware(request);

    expect(createServerClient).toHaveBeenCalledWith(
      'https://supabase.example',
      'anon-key',
      { cookies: {} }
    );
    expect(mockedNextResponse.next).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ mocked: true });
  });
});
