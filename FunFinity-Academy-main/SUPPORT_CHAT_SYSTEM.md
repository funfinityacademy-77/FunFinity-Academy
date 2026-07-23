# Support Chat System Documentation

A comprehensive, real-time customer support chat system built with React, Tailwind CSS, Vite, and Supabase.

## Architecture

The system consists of two primary components:
1. **Embeddable Floating Chat Widget** - Client-side widget for visitors
2. **Agent Management Dashboard** - Back-office view for support agents

## Database Schema

### Tables

#### `support_tickets`
- `id` (UUID, Primary Key)
- `visitor_name` (TEXT, NOT NULL)
- `visitor_email` (TEXT, Optional)
- `status` (TEXT, NOT NULL) - 'open', 'assigned', 'resolved'
- `session_id` (TEXT, NOT NULL, UNIQUE)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)
- `assigned_to` (UUID, Optional)
- `last_message_at` (TIMESTAMP WITH TIME ZONE)

#### `ticket_messages`
- `id` (UUID, Primary Key)
- `ticket_id` (UUID, Foreign Key → support_tickets.id)
- `sender_type` (TEXT, NOT NULL) - 'visitor', 'agent', 'system'
- `sender_name` (TEXT, NOT NULL)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `read_at` (TIMESTAMP WITH TIME ZONE, Optional)

### Security Features

- **Row Level Security (RLS)** enabled on both tables
- Visitors can only access their own tickets via session_id
- Agents can view and manage all tickets
- PostgreSQL Replication (`REPLICA IDENTITY FULL`) for real-time streaming
- Supabase Presence channels for online/offline status

## Installation

### 1. Database Setup

Execute the SQL migration file:

```bash
# Run the migration in Supabase SQL Editor
cat 06-support-chat-schema.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 2. Build the Widget

```bash
npm run build:widget
```

This will create a bundled JavaScript file in the `dist` directory.

### 3. Deploy the Widget

Copy the generated `widget.umd.js` file to your web server or CDN.

## Usage

### Embedding the Widget

Add the widget to any HTML page using a single script tag:

```html
<script 
  src="/path/to/widget.umd.js" 
  data-supabase-url="YOUR_SUPABASE_URL" 
  data-supabase-key="YOUR_SUPABASE_ANON_KEY" 
  data-logo-url="https://example.com/logo.png" 
  data-primary-color="#3B82F6"
  data-text-color="#1F2937"
  data-bubble-background="#F3F4F6">
</script>
```

### Configuration Parameters

- `data-supabase-url` (Required) - Your Supabase project URL
- `data-supabase-key` (Required) - Your Supabase anonymous key
- `data-logo-url` (Optional) - URL to your company logo
- `data-primary-color` (Optional) - Primary theme color (default: #3B82F6)
- `data-text-color` (Optional) - Text color (default: #1F2937)
- `data-bubble-background` (Optional) - Chat bubble background (default: #F3F4F6)

### Accessing the Agent Dashboard

Navigate to `/admin/support` in your application to access the agent management dashboard.

## Features

### Chat Widget

- **Floating Bubble** - Beautiful, responsive chat bubble in bottom-right corner
- **Smooth Transitions** - Animated open/close transitions
- **Dynamic Theming** - Customizable colors to match your branding
- **Session Persistence** - Automatic session restoration via localStorage
- **Real-time Messaging** - Instant message delivery via Supabase Realtime
- **Online Status** - Agent online/offline indicator
- **Initialization Screen** - Name/email collection for new visitors

### Agent Dashboard

- **Dual-Column Layout** - Ticket feed on left, conversation on right
- **Real-time Updates** - Live ticket feed with instant updates
- **Status Filters** - Quick filters for Open, Assigned, Resolved
- **Unread Indicators** - Visual indicators for unread messages
- **Time Tracking** - Shows how long ago last message was sent
- **Quick Actions** - Instant status changes and system messages
- **Rich Input** - Full-featured message input area

## Real-time Features

### Message Streaming

Messages are streamed in real-time using Supabase Realtime subscriptions. The system automatically:

- Subscribes to new messages for active tickets
- Updates the message list instantly
- Scrolls to the latest message
- Maintains connection state

### Presence Tracking

The system tracks agent and visitor presence:

- Agents can see when visitors are online
- Visitors can see when agents are online
- Presence is broadcast via Supabase Presence channels

### Typing Indicators

The system supports typing indicators (implementation can be extended):

- Track when users are typing
- Broadcast typing state via presence channels
- Display typing indicators in the UI

## Security Considerations

### Row Level Security (RLS)

The database uses RLS policies to ensure:

- Visitors can only access their own tickets
- Visitors can only insert messages for their own tickets
- Agents can view and manage all tickets
- All operations are authenticated

### Session Management

- Each visitor gets a unique session ID
- Session ID is stored in localStorage
- Session ID is used for RLS policy enforcement
- Sessions persist across page reloads

### API Security

- Uses Supabase anonymous key for public access
- RLS policies enforce data isolation
- No sensitive data exposed to clients
- All database operations are validated

## Development

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── support-chat/
│   │       ├── SupportChatWidget.tsx    # Main widget component
│   │       └── widget-entry.tsx           # Widget entry point
│   └── pages/
│       └── admin/
│           └── SupportDashboard.tsx        # Agent dashboard
├── vite.widget.config.ts                   # Widget build config
└── package.json                            # Build scripts
```

### Building the Widget

```bash
# Build the widget bundle
npm run build:widget

# The output will be in dist/widget.umd.js
```

### Running the Dashboard

The dashboard is integrated into the main application:

```bash
# Start the development server
npm run dev

# Access the dashboard at http://localhost:8080/admin/support
```

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify Supabase URL and key are correct
3. Ensure the widget script is loaded before DOM content
4. Check that the script tag has all required data attributes

### Real-time Updates Not Working

1. Verify Supabase Realtime is enabled
2. Check that REPLICA IDENTITY FULL is set on ticket_messages
3. Ensure RLS policies allow real-time subscriptions
4. Check network connectivity

### Dashboard Not Showing Tickets

1. Verify database schema is correctly set up
2. Check that RLS policies are properly configured
3. Ensure the user has agent permissions
4. Check browser console for errors

## Performance Optimization

### Widget Bundle

- Minified and optimized for production
- External dependencies (React, ReactDOM) are not bundled
- Styles are injected inline
- Tree-shaking removes unused code

### Database

- Indexed columns for fast queries
- Efficient RLS policies
- Real-time subscriptions only for active tickets
- Connection pooling for multiple agents

## Future Enhancements

Potential improvements to consider:

- File attachment support
- Rich text editor for messages
- Ticket assignment to specific agents
- Canned responses / quick replies
- Chat history export
- Analytics and reporting
- Multi-language support
- Mobile app integration
- Voice/video chat integration
- AI-powered chatbot integration

## Support

For issues or questions:

1. Check this documentation
2. Review the Supabase dashboard for database issues
3. Check browser console for errors
4. Verify all configuration parameters

## License

This support chat system is part of the FunFinity Academy platform.
