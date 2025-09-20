# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_NAME=Achivio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon public key
5. Copy the service_role key (keep this secret!)

## Database Setup

1. Run the SQL scripts in this order:
   - `supabase-schema.sql` - Creates tables and functions
   - `supabase-seed-data.sql` - Inserts initial data
   - `DISABLE_ALL_RLS.sql` - Disables RLS for development (optional)

2. Or use the individual RLS policy files as needed

## Security Notes

- Never commit `.env.local` or any environment files
- The service role key has full database access
- Use RLS policies in production
- Rotate keys regularly

## Development vs Production

- **Development**: RLS disabled for easier testing
- **Production**: Enable RLS with proper policies
- **Environment**: Use different Supabase projects for dev/prod
