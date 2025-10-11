-- Row Level Security (RLS) Policies for ICT Trading Database
-- This migration sets up comprehensive security policies for multi-user access

-- Enable RLS on all tables
ALTER TABLE ict_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ict_trading_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ict_entry_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE ict_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ict_time_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ict_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;

-- ICT Definitions Policies (Public read, authenticated write)
CREATE POLICY "Public can read ICT definitions" ON ict_definitions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ICT definitions" ON ict_definitions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ICT definitions" ON ict_definitions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ICT definitions" ON ict_definitions
    FOR DELETE USING (auth.role() = 'authenticated');

-- ICT Trading Models Policies (Public read, authenticated write)
CREATE POLICY "Public can read ICT trading models" ON ict_trading_models
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ICT trading models" ON ict_trading_models
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ICT trading models" ON ict_trading_models
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ICT trading models" ON ict_trading_models
    FOR DELETE USING (auth.role() = 'authenticated');

-- ICT Entry Techniques Policies (Public read, authenticated write)
CREATE POLICY "Public can read ICT entry techniques" ON ict_entry_techniques
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ICT entry techniques" ON ict_entry_techniques
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ICT entry techniques" ON ict_entry_techniques
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ICT entry techniques" ON ict_entry_techniques
    FOR DELETE USING (auth.role() = 'authenticated');

-- ICT Patterns Policies (Public read, authenticated write)
CREATE POLICY "Public can read ICT patterns" ON ict_patterns
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ICT patterns" ON ict_patterns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ICT patterns" ON ict_patterns
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ICT patterns" ON ict_patterns
    FOR DELETE USING (auth.role() = 'authenticated');

-- ICT Time Windows Policies (Public read, authenticated write)
CREATE POLICY "Public can read ICT time windows" ON ict_time_windows
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ICT time windows" ON ict_time_windows
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ICT time windows" ON ict_time_windows
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ICT time windows" ON ict_time_windows
    FOR DELETE USING (auth.role() = 'authenticated');

-- ICT Trades Policies (User-specific access)
CREATE POLICY "Users can read their own trades" ON ict_trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" ON ict_trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" ON ict_trades
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" ON ict_trades
    FOR DELETE USING (auth.uid() = user_id);

-- Admin users can access all trades
CREATE POLICY "Admins can read all trades" ON ict_trades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND settings->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can update all trades" ON ict_trades
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND settings->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can delete all trades" ON ict_trades
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND settings->>'role' = 'admin'
        )
    );

-- Embeddings Policies (Authenticated users can manage embeddings)
CREATE POLICY "Authenticated users can read embeddings" ON embeddings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert embeddings" ON embeddings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update embeddings" ON embeddings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete embeddings" ON embeddings
    FOR DELETE USING (auth.role() = 'authenticated');

-- User Profiles Policies (Users can manage their own profiles)
CREATE POLICY "Users can read their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Public can read basic profile info (username, full_name, bio, avatar_url)
CREATE POLICY "Public can read basic profile info" ON user_profiles
    FOR SELECT USING (true);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND settings->>'role' = 'admin'
        )
    );

-- Knowledge Relationships Policies (Authenticated users can manage relationships)
CREATE POLICY "Authenticated users can read knowledge relationships" ON knowledge_relationships
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert knowledge relationships" ON knowledge_relationships
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update knowledge relationships" ON knowledge_relationships
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete knowledge relationships" ON knowledge_relationships
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant necessary permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON ict_definitions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ict_definitions TO authenticated;

GRANT SELECT ON ict_trading_models TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ict_trading_models TO authenticated;

GRANT SELECT ON ict_entry_techniques TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ict_entry_techniques TO authenticated;

GRANT SELECT ON ict_patterns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ict_patterns TO authenticated;

GRANT SELECT ON ict_time_windows TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ict_time_windows TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ict_trades TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON embeddings TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_relationships TO authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_trade_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_model_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pattern_analysis() TO authenticated;
GRANT EXECUTE ON FUNCTION get_time_window_analysis() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION match_embeddings(vector, float, int) TO authenticated;

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, full_name, settings)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'settings', '{}')::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id 
        AND settings->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text AS $$
BEGIN
    RETURN (
        SELECT COALESCE(settings->>'role', 'user')
        FROM user_profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;