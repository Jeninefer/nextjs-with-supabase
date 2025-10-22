# Supabase Integration - Quick Start

## ✅ What's Been Done

Your Office Add-in now has full Supabase integration! Here's what's included:

### Files Created

1. **Configuration**
   - `.env.example` - Template for environment variables
   - `.env` - Your Supabase credentials (not committed to git)
   - `src/supabase/config.js` - Configuration management

2. **Supabase Client**
   - `src/supabase/client.js` - Initialize and test Supabase connection
   - `src/supabase/service.js` - Helper functions for auth, database, storage, real-time

3. **UI Integration**
   - Updated `src/taskpane/taskpane.html` - New UI with Supabase status and demo buttons
   - Updated `src/taskpane/taskpane.js` - Integration examples and handlers
   - Updated `src/taskpane/taskpane.css` - Styling for new components

4. **Documentation**
   - `SUPABASE_GUIDE.md` - Comprehensive integration guide
   - Updated `README.md` - Added Supabase setup section
   - `SUPABASE_QUICKSTART.md` - This file!

5. **Build Configuration**
   - Updated `webpack.config.js` - Added dotenv-webpack for environment variables
   - Updated `.gitignore` - Excludes .env files from git

### Dependencies Installed

- `@supabase/supabase-js` - Supabase JavaScript client
- `dotenv-webpack` - Load environment variables in webpack

## 🚀 Next Steps

### 1. Set Up Your Supabase Project

```bash
# Go to https://supabase.com and create a project
# Then get your credentials from Project Settings → API
```

### 2. Configure Your Credentials

Edit the `.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Tables (Optional)

If you want to test the database functionality, create a `documents` table in Supabase:

```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make table public for testing (or set up RLS policies)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON documents FOR INSERT WITH CHECK (true);
```

### 4. Test the Integration

The dev server is already running! Open PowerPoint and:

1. The taskpane will show Supabase connection status
2. Click "Test Connection" to verify your setup
3. Click "Save to DB" to insert test data
4. Click "Load from DB" to retrieve data

## 📚 Features Available

### Authentication

```javascript
import { auth } from './supabase/service';

// Sign up, sign in, sign out, get current user
await auth.signUp(email, password);
await auth.signIn(email, password);
await auth.signOut();
const { user } = await auth.getCurrentUser();
```

### Database

```javascript
import { db } from './supabase/service';

// CRUD operations
await db.select('table_name');
await db.insert('table_name', data);
await db.update('table_name', data, { id: 1 });
await db.delete('table_name', { id: 1 });
```

### Storage

```javascript
import { storage } from './supabase/service';

// Upload, download, get URLs
await storage.upload('bucket', 'path/file.pdf', file);
await storage.download('bucket', 'path/file.pdf');
const url = storage.getPublicUrl('bucket', 'path/file.pdf');
```

### Real-time

```javascript
import { realtime } from './supabase/service';

// Subscribe to changes
const channel = realtime.subscribe('table_name', (payload) => {
  console.log('Change:', payload);
});

// Unsubscribe
await realtime.unsubscribe(channel);
```

## 🔍 File Structure

```text
src/
├── supabase/
│   ├── client.js      # Supabase client initialization
│   ├── config.js      # Configuration validation
│   └── service.js     # Helper functions
├── taskpane/
│   ├── taskpane.html  # UI with Supabase demo
│   ├── taskpane.js    # Integration examples
│   └── taskpane.css   # Styling
└── commands/
    ├── commands.html
    └── commands.js

.env                   # Your credentials (not in git)
.env.example           # Template
webpack.config.js      # Updated with dotenv
SUPABASE_GUIDE.md      # Full documentation
```

## 🐛 Troubleshooting

### "Supabase not configured" Warning

**Solution**: Edit `.env` with your actual Supabase credentials

### Connection Test Fails

**Solutions**:

1. Verify credentials in Supabase dashboard
2. Check if project is paused (free tier auto-pauses)
3. Ensure internet connection is working

### "Table does not exist" Error

**Solution**: Create the table in Supabase Dashboard → Table Editor

## 📖 Documentation

- **SUPABASE_GUIDE.md** - Complete integration guide with all APIs
- **README.md** - Project setup and overview
- [Supabase Docs](https://supabase.com/docs) - Official documentation

## 💡 Example Use Cases

1. **Save Documents**: Store PowerPoint content in Supabase database
2. **User Auth**: Require login to access add-in features
3. **File Upload**: Save presentations to Supabase storage
4. **Real-time Sync**: Collaborate with other users in real-time
5. **Analytics**: Track add-in usage in database

## ✨ What's Working Now

- ✅ Supabase client initialized
- ✅ Connection testing
- ✅ Environment variables loaded
- ✅ Helper functions ready
- ✅ UI integration complete
- ✅ Dev server running with hot reload
- ✅ Documentation complete

## 🎯 Ready to Use

Your add-in is ready to use Supabase! Just:

1. Add your credentials to `.env`
2. Test the connection in the taskpane
3. Start building your features!

For detailed examples and API reference, see [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md).
