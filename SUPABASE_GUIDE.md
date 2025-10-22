# Supabase Integration Guide

This Office Add-in is integrated with Supabase for backend data management, authentication, storage, and real-time functionality.

## Table of Contents

- [Setup](#setup)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Database Schema Example](#database-schema-example)
- [Troubleshooting](#troubleshooting)

## Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/log in
2. Create a new project
3. Wait for the project to finish setting up
4. Go to Project Settings → API

### 2. Get Your Credentials

From the API settings page, copy:

- **Project URL** (e.g., `https://xxxxx.supabase.co`)
- **anon/public key** (starts with `eyJ...`)

### 3. Configure the Add-in

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:

   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Rebuild the project:

   ```bash
   npm run build:dev
   ```

## Configuration

The Supabase integration is configured through three main files:

### `src/supabase/config.js`

Configuration and validation of Supabase credentials.

### `src/supabase/client.js`

Supabase client initialization and connection testing.

### `src/supabase/service.js`

Helper functions for common Supabase operations.

## Usage Examples

### Authentication

```javascript
import { auth } from './supabase/service';

// Sign up a new user
const { user, error } = await auth.signUp('user@example.com', 'password123');

// Sign in
const { user, session, error } = await auth.signIn('user@example.com', 'password123');

// Get current user
const { user, error } = await auth.getCurrentUser();

// Sign out
await auth.signOut();
```

### Database Operations

```javascript
import { db } from './supabase/service';

// Select all records
const { data, error } = await db.select('documents');

// Select specific columns
const { data, error } = await db.select('documents', 'id, title, created_at');

// Insert data
const { data, error } = await db.insert('documents', {
  title: 'My Document',
  content: 'Document content',
  user_id: '123'
});

// Update data
const { data, error } = await db.update(
  'documents',
  { title: 'Updated Title' },
  { id: 1 }
);

// Delete data
const { data, error } = await db.delete('documents', { id: 1 });
```

### Direct Supabase Client Usage

```javascript
import { supabase } from './supabase/client';

// Complex queries
const { data, error } = await supabase
  .from('documents')
  .select('*, user:users(*)')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10);

// Using filters
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .gte('created_at', '2024-01-01')
  .ilike('title', '%search%');
```

### Storage Operations

```javascript
import { storage } from './supabase/service';

// Upload a file
const file = document.getElementById('fileInput').files[0];
const { data, error } = await storage.upload('documents', 'folder/file.pdf', file);

// Get public URL
const url = storage.getPublicUrl('documents', 'folder/file.pdf');

// Download a file
const { data, error } = await storage.download('documents', 'folder/file.pdf');

// Delete files
const { data, error } = await storage.delete('documents', ['folder/file.pdf']);
```

### Real-time Subscriptions

```javascript
import { realtime } from './supabase/service';

// Subscribe to all changes
const channel = realtime.subscribe('documents', (payload) => {
  console.log('Change received!', payload);
});

// Subscribe to specific events
const channel = realtime.subscribe('documents', (payload) => {
  console.log('New record inserted!', payload);
}, 'INSERT');

// Unsubscribe
await realtime.unsubscribe(channel);
```

## API Reference

### Authentication API (`auth`)

- `signUp(email, password)` - Register new user
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out current user
- `getCurrentUser()` - Get current user info
- `getSession()` - Get current session

### Database API (`db`)

- `select(table, columns)` - Query data
- `insert(table, data)` - Insert new records
- `update(table, data, match)` - Update existing records
- `delete(table, match)` - Delete records

### Storage API (`storage`)

- `upload(bucket, path, file)` - Upload file
- `download(bucket, path)` - Download file
- `getPublicUrl(bucket, path)` - Get public URL
- `delete(bucket, paths)` - Delete files

### Real-time API (`realtime`)

- `subscribe(table, callback, event)` - Subscribe to changes
- `unsubscribe(channel)` - Unsubscribe from channel

## Database Schema Example

### Create a `documents` table in Supabase

Go to your Supabase project → SQL Editor and run:

```sql
-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Enable Real-time (optional)

In Supabase Dashboard → Database → Replication:

1. Enable replication for the `documents` table
2. Select events to broadcast (INSERT, UPDATE, DELETE)

## Troubleshooting

### "Supabase not configured" Error

**Problem**: Environment variables not loaded

**Solution**:

1. Ensure `.env` file exists in project root
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
3. Rebuild the project: `npm run build:dev`
4. Restart the dev server

### Connection Test Fails

**Problem**: Cannot connect to Supabase

**Solutions**:

1. Check your internet connection
2. Verify credentials in Supabase dashboard
3. Ensure project is not paused (free tier projects pause after inactivity)
4. Check browser console for detailed error messages

### "Table does not exist" Error

**Problem**: Trying to query a table that doesn't exist

**Solution**:

1. Go to Supabase Dashboard → Table Editor
2. Create the required tables
3. Or remove the demo code in `taskpane.js` that references non-existent tables

### CORS Errors

**Problem**: Cross-origin request blocked

**Solution**:

1. This shouldn't happen with Office Add-ins, but if it does:
2. Check that you're using the correct Supabase URL
3. Verify your Supabase project is active

### Row Level Security (RLS) Policies

**Problem**: Can't read/write data even though authenticated

**Solution**:

1. Go to Supabase Dashboard → Authentication → Policies
2. Create appropriate RLS policies for your tables
3. Or disable RLS for testing (not recommended for production):

   ```sql
   ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |

**Note**: Never commit your `.env` file to version control. It's already in `.gitignore`.

## Best Practices

1. **Security**: Always use Row Level Security (RLS) policies in production
2. **Error Handling**: Always check for errors in Supabase responses
3. **Performance**: Use selective column queries instead of `SELECT *`
4. **Real-time**: Unsubscribe from channels when components unmount
5. **Authentication**: Store user sessions securely
6. **Testing**: Test database operations in Supabase dashboard first

## Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)

## Support

For issues specific to this integration:

1. Check the browser console for detailed error messages
2. Review the Supabase logs in your project dashboard
3. Verify your `.env` configuration
4. Test the connection using the "Test Connection" button in the add-in

For Supabase-specific issues, visit [Supabase Support](https://supabase.com/support).
