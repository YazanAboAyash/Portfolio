-- COMPLETELY DISABLE RLS FOR DEBUGGING
-- This is for debugging purposes - RLS is completely disabled

-- Drop any existing policies first
DROP POLICY IF EXISTS "allow_all_blog_categories" ON "public"."blog_categories";
DROP POLICY IF EXISTS "allow_all_blogs" ON "public"."blogs";
DROP POLICY IF EXISTS "allow_all_blog_credits" ON "public"."blog_credits";

-- Disable RLS completely
ALTER TABLE "public"."blog_categories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."blogs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."blog_credits" DISABLE ROW LEVEL SECURITY;

-- Grant maximum permissions to all roles
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;

-- Grant usage and select on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Allow public access to everything
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Make sure the database is accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
