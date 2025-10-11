-- Storage Policies for ICT AI Knowledge System
-- This migration sets up comprehensive storage policies for the ICT_B bucket
-- Created to support file storage and management for ICT trading system
-- Updated with anscripts-alpha policy configuration

-- =====================================================
-- 1. ENABLE RLS ON STORAGE TABLES
-- =====================================================

-- Enable RLS on storage tables (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREATE ICT_B BUCKET (if it doesn't exist)
-- =====================================================

-- Insert ICT_B bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ICT_B',
    'ICT_B',
    false,
    52428800, -- 50MB limit
    ARRAY[
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/json',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. ANSCRIPTS-ALPHA POLICY FOR ICT_B BUCKET
-- =====================================================

-- Drop existing policies if they exist (for clean redeployment)
DROP POLICY IF EXISTS "anscripts-alpha-select" ON storage.objects;
DROP POLICY IF EXISTS "anscripts-alpha-insert" ON storage.objects;
DROP POLICY IF EXISTS "anscripts-alpha-update" ON storage.objects;
DROP POLICY IF EXISTS "anscripts-alpha-delete" ON storage.objects;
DROP POLICY IF EXISTS "anscripts-alpha" ON storage.objects;
DROP POLICY IF EXISTS "service-role-full-access" ON storage.objects;
DROP POLICY IF EXISTS "ICT_B bucket access" ON storage.buckets;

-- Comprehensive anscripts-alpha policy for all operations
CREATE POLICY "anscripts-alpha" ON storage.objects
    FOR ALL
    TO service_role, authenticated, anon, supabase_realtime_admin, supabase_replication_admin
    USING (bucket_id = 'ICT_B')
    WITH CHECK (bucket_id = 'ICT_B');

-- =====================================================
-- 4. BUCKET ACCESS POLICIES
-- =====================================================

-- Allow all specified roles to read bucket information
CREATE POLICY "ICT_B bucket access" ON storage.buckets
    FOR SELECT
    TO service_role, authenticated, anon, supabase_realtime_admin, supabase_replication_admin
    USING (id = 'ICT_B');

-- =====================================================
-- 5. ADDITIONAL SECURITY POLICIES
-- =====================================================

-- Enhanced security: Authenticated users can only manage their own files
-- (This is a more restrictive alternative - uncomment if needed)
/*
CREATE POLICY "anscripts-alpha-user-files" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'ICT_B' AND 
        (owner_id = auth.uid()::text OR auth.role() = 'service_role')
    )
    WITH CHECK (
        bucket_id = 'ICT_B' AND 
        (owner_id = auth.uid()::text OR auth.role() = 'service_role')
    );
*/

-- Admin override policy for service role (redundant with main policy but kept for clarity)
CREATE POLICY "service-role-full-access" ON storage.objects
    FOR ALL
    TO service_role
    USING (bucket_id = 'ICT_B')
    WITH CHECK (bucket_id = 'ICT_B');

-- =====================================================
-- 6. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant storage permissions to roles
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.buckets TO anon;

-- Grant permissions for realtime and replication admin roles
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO supabase_realtime_admin;
GRANT SELECT ON storage.buckets TO supabase_realtime_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO supabase_replication_admin;
GRANT SELECT ON storage.buckets TO supabase_replication_admin;

-- =====================================================
-- 7. POLICY DOCUMENTATION AND VERIFICATION
-- =====================================================

-- Create a view to monitor policy effectiveness
CREATE OR REPLACE VIEW storage.ict_b_policy_status AS
SELECT 
    'ICT_B Storage Policies' as policy_group,
    COUNT(*) as total_policies,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (policyname LIKE '%anscripts-alpha%' OR policyname LIKE '%ICT_B%');

-- Success message
SELECT 
    'ICT_B Storage Policies Created Successfully!' as status,
    NOW() as created_at,
    'anscripts-alpha policy active for SELECT, INSERT, UPDATE, DELETE operations' as message;

-- =====================================================
-- POLICY SUMMARY
-- =====================================================
/*
POLICY SUMMARY:
- anscripts-alpha: Comprehensive policy allowing SELECT, INSERT, UPDATE, DELETE operations on ICT_B bucket for all specified roles
- ICT_B bucket access: Allows reading bucket information
- service-role-full-access: Provides full access override for service role

TARGET ROLES:
- service_role: Full administrative access
- authenticated: Standard user access
- anon: Anonymous read access
- supabase_realtime_admin: Realtime functionality access
- supabase_replication_admin: Replication functionality access

SECURITY FEATURES:
- File size limit: 50MB
- Allowed MIME types: Images, PDFs, text files, spreadsheets, SVG
- Bucket-specific access control (bucket_id = 'ICT_B')
- Role-based permissions
- Service role override for administrative tasks

POLICY CONDITIONS:
- All operations are restricted to bucket_id = 'ICT_B'
- USING clause controls read access
- WITH CHECK clause controls write access
- Supports all CRUD operations (SELECT, INSERT, UPDATE, DELETE)
*/