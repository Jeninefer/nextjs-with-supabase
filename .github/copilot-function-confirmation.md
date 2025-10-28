# Function Deployment Confirmation

- **Function name (slug):** notify-user
- **Brief behavior / purpose:**  
  Accepts a POST request with a user ID and message.  
  Inserts a notification row into the Supabase `notifications` table.  
  If `SLACK_BOT_TOKEN` is set, looks up the user's `slack_id` in the `users` table and sends the message to Slack.  
  Returns success or error.
- **Route(s) needed:**  
  POST /api/notify-user
- **Environment variable names required (names only):**  
  SUPABASE_URL  
  SUPABASE_ANON_KEY  
  SLACK_BOT_TOKEN (optional)
- **Deploy now?**  
  yes
