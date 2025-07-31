# Supabase Authentication Setup

This project now includes Supabase authentication. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - `anon` public key
   - `service_role` secret key (optional, for server-side operations)

## 3. Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

## 4. Set Up Database

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_create_profiles.sql`
3. Run the SQL to create the profiles table and triggers

## 5. Configure Authentication Providers (Optional)

### Google OAuth Setup

1. In your Supabase project dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Add the Client ID and Client Secret to Supabase

## 6. Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `/auth/v1/login` or `/auth/v2/login`
3. Try registering a new account
4. Check your Supabase dashboard to see the new user and profile

## Features Included

- ✅ Email/Password Authentication
- ✅ Google OAuth (when configured)
- ✅ User Registration with Email Verification
- ✅ User Profiles with Role Management
- ✅ Protected Routes with Middleware
- ✅ Session Management
- ✅ Logout Functionality
- ✅ Authentication Context for Client Components

## File Structure

```
src/
├── contexts/
│   └── auth-context.tsx          # Client-side authentication context
├── lib/
│   ├── auth-utils.ts            # Server-side auth utilities
│   └── supabase/
│       ├── client.ts            # Supabase client for client components
│       ├── server.ts            # Supabase client for server components
│       └── middleware.ts        # Supabase middleware utilities
├── types/
│   └── auth.ts                  # Authentication type definitions
├── app/
│   ├── auth/
│   │   ├── callback/            # OAuth callback handler
│   │   └── auth-code-error/     # Error page for auth failures
│   └── (main)/
│       └── auth/
│           └── _components/     # Updated login/register forms
└── middleware.ts                # Next.js middleware for route protection
```

## Customization

- Update user roles in `supabase/migrations/001_create_profiles.sql`
- Modify the profile schema to include additional fields
- Customize the authentication UI components in `src/app/(main)/auth/_components/`
- Add more OAuth providers in Supabase dashboard

## Troubleshooting

- Make sure your environment variables are set correctly
- Check that the profiles table and triggers are created in Supabase
- Verify that RLS (Row Level Security) policies are enabled
- Check the browser console and Supabase logs for any errors
