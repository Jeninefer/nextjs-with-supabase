# Test Supabase API Route

## Overview

The `/api/test-supabase` route provides a health check and connectivity test for your Supabase database connection. It includes performance metrics and detailed error reporting.

## Setup

### 1. Configure Environment Variables

Create or update `.env.local` in the project root with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important Security Notes:**
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used on the server-side
- This key bypasses Row Level Security (RLS) policies

### 2. Get Your Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Settings → API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Start the Development Server

```bash
npm run dev
```

## Testing the Endpoint

### Using a Browser

Navigate to: `http://localhost:3001/api/test-supabase`

### Using curl

```bash
# Basic request
curl http://localhost:3001/api/test-supabase

# View all headers including timing metrics
curl -i http://localhost:3001/api/test-supabase
```

## Response Format

### Success Response (200 OK)

```json
{
  "ok": true,
  "meta": {
    "environment": {
      "url_present": true,
      "service_key_present": true
    },
    "timings": {
      "query_ms": 45,
      "total_request_ms": 52
    }
  },
  "count": 5,
  "data": [
    // ... array of records from kv_store_08a31cde table
  ]
}
```

### Error Response (500)

When environment variables are missing:
```json
{
  "error": "Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
}
```

When database query fails:
```json
{
  "error": "relation \"public.kv_store_08a31cde\" does not exist",
  "queryTimeMs": 15
}
```

## Performance Headers

The API includes custom headers for monitoring performance:

- **`X-Query-Time-ms`**: Time spent on the Supabase query (milliseconds)
- **`X-Total-Time-ms`**: Total request processing time (milliseconds)
- **`Server-Timing`**: Standard header for browser DevTools performance monitoring
  - Format: `db;dur=<query_ms>, total;dur=<total_ms>`

### Viewing Performance in Browser DevTools

1. Open Developer Tools (F12)
2. Go to the Network tab
3. Click on the request to `/api/test-supabase`
4. View the **Timing** tab to see Server-Timing metrics

## Customization

To test a different table, modify `app/api/test-supabase/route.ts`:

```typescript
const { data, error } = await supabase
  .from("your_table_name")  // Change this
  .select("*")
  .limit(10);
```

## Troubleshooting

### Error: "Missing environment variables"

**Solution**: Ensure `.env.local` exists and contains all required variables. Restart the dev server after creating/updating `.env.local`.

### Error: "relation does not exist"

**Solution**: The table `kv_store_08a31cde` doesn't exist in your database. Either:
1. Create the table in your Supabase database, or
2. Update the route to query an existing table

### Error: "fetch failed" or network errors

**Solution**: 
- Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check your internet connection
- Ensure Supabase project is active (not paused)

### Middleware redirects to /sign-in

**Solution**: The middleware has been configured to exclude API routes from authentication checks. If you still see redirects, verify `middleware.ts` has `api` in the exclusion pattern:

```typescript
matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
```

## Production Considerations

1. **Remove or protect this endpoint** before deploying to production
2. Consider adding authentication/authorization
3. Rate limit the endpoint to prevent abuse
4. Log metrics to your monitoring system
5. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client

## Related Files

- API Route: `app/api/test-supabase/route.ts`
- Environment Example: `.env.example`
- Middleware: `middleware.ts`
