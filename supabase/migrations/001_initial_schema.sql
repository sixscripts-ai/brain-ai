-- ICT Trading Database Schema for Supabase PostgreSQL
-- This migration creates the complete ICT trading knowledge system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE market_session_type AS ENUM ('London', 'New York', 'Asian', 'Sydney');
CREATE TYPE trade_direction_type AS ENUM ('Long', 'Short');
CREATE TYPE difficulty_level_type AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');
CREATE TYPE pattern_type_enum AS ENUM ('Reversal', 'Continuation', 'Breakout', 'Consolidation');

-- ICT Definitions Table
CREATE TABLE ict_definitions (
    id SERIAL PRIMARY KEY,
    concept VARCHAR(100) NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    key_characteristics TEXT,
    market_context TEXT,
    usage_notes TEXT,
    related_concepts TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICT Trading Models Table
CREATE TABLE ict_trading_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    key_components TEXT[],
    entry_criteria TEXT NOT NULL,
    exit_criteria TEXT NOT NULL,
    risk_management TEXT,
    success_rate DECIMAL(5,2) CHECK (success_rate >= 0 AND success_rate <= 100),
    difficulty_level difficulty_level_type NOT NULL,
    market_conditions TEXT,
    timeframes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICT Entry Techniques Table
CREATE TABLE ict_entry_techniques (
    id SERIAL PRIMARY KEY,
    technique_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    setup_requirements TEXT NOT NULL,
    entry_trigger TEXT NOT NULL,
    stop_loss_placement TEXT,
    take_profit_strategy TEXT,
    risk_reward_ratio DECIMAL(4,2),
    difficulty_level difficulty_level_type NOT NULL,
    best_timeframes TEXT[],
    market_sessions market_session_type[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICT Patterns Table
CREATE TABLE ict_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(100) NOT NULL UNIQUE,
    pattern_type pattern_type_enum NOT NULL,
    description TEXT NOT NULL,
    identification_rules TEXT NOT NULL,
    trading_strategy TEXT,
    reliability_score DECIMAL(3,2) CHECK (reliability_score >= 0 AND reliability_score <= 1),
    best_timeframes TEXT[],
    market_context TEXT,
    examples TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICT Time Windows Table
CREATE TABLE ict_time_windows (
    id SERIAL PRIMARY KEY,
    window_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    market_session market_session_type NOT NULL,
    description TEXT,
    significance TEXT,
    trading_opportunities TEXT,
    volatility_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICT Trades Table
CREATE TABLE ict_trades (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trade_date DATE NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    direction trade_direction_type NOT NULL,
    entry_price DECIMAL(10,5) NOT NULL,
    exit_price DECIMAL(10,5),
    stop_loss DECIMAL(10,5),
    take_profit DECIMAL(10,5),
    quantity DECIMAL(10,2) NOT NULL,
    pnl DECIMAL(10,2),
    risk_reward_ratio DECIMAL(4,2),
    model_used VARCHAR(100),
    pattern_identified VARCHAR(100),
    time_window VARCHAR(100),
    entry_technique VARCHAR(100),
    notes TEXT,
    trade_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector Embeddings Table for AI/ML features
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB,
    content_type VARCHAR(50),
    source_table VARCHAR(50),
    source_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    trading_experience difficulty_level_type DEFAULT 'Beginner',
    preferred_timeframes TEXT[],
    favorite_models TEXT[],
    bio TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Graph Relationships Table
CREATE TABLE knowledge_relationships (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL,
    source_id INTEGER NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    strength DECIMAL(3,2) DEFAULT 1.0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ict_definitions_concept ON ict_definitions(concept);
CREATE INDEX idx_ict_definitions_search ON ict_definitions USING gin(to_tsvector('english', concept || ' ' || definition));

CREATE INDEX idx_ict_trading_models_name ON ict_trading_models(model_name);
CREATE INDEX idx_ict_trading_models_success_rate ON ict_trading_models(success_rate DESC);

CREATE INDEX idx_ict_entry_techniques_name ON ict_entry_techniques(technique_name);
CREATE INDEX idx_ict_entry_techniques_difficulty ON ict_entry_techniques(difficulty_level);

CREATE INDEX idx_ict_patterns_name ON ict_patterns(pattern_name);
CREATE INDEX idx_ict_patterns_type ON ict_patterns(pattern_type);
CREATE INDEX idx_ict_patterns_reliability ON ict_patterns(reliability_score DESC);

CREATE INDEX idx_ict_time_windows_session ON ict_time_windows(market_session);
CREATE INDEX idx_ict_time_windows_time ON ict_time_windows(start_time, end_time);

CREATE INDEX idx_ict_trades_user_id ON ict_trades(user_id);
CREATE INDEX idx_ict_trades_date ON ict_trades(trade_date DESC);
CREATE INDEX idx_ict_trades_symbol ON ict_trades(symbol);
CREATE INDEX idx_ict_trades_model ON ict_trades(model_used);
CREATE INDEX idx_ict_trades_pnl ON ict_trades(pnl DESC);

CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_embeddings_content_type ON embeddings(content_type);
CREATE INDEX idx_embeddings_source ON embeddings(source_table, source_id);

CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_experience ON user_profiles(trading_experience);

CREATE INDEX idx_knowledge_relationships_source ON knowledge_relationships(source_type, source_id);
CREATE INDEX idx_knowledge_relationships_target ON knowledge_relationships(target_type, target_id);
CREATE INDEX idx_knowledge_relationships_type ON knowledge_relationships(relationship_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_ict_definitions_updated_at BEFORE UPDATE ON ict_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ict_trading_models_updated_at BEFORE UPDATE ON ict_trading_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ict_entry_techniques_updated_at BEFORE UPDATE ON ict_entry_techniques FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ict_patterns_updated_at BEFORE UPDATE ON ict_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ict_time_windows_updated_at BEFORE UPDATE ON ict_time_windows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ict_trades_updated_at BEFORE UPDATE ON ict_trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RPC functions for analytics
CREATE OR REPLACE FUNCTION get_trade_statistics()
RETURNS TABLE (
    total_trades BIGINT,
    winning_trades BIGINT,
    losing_trades BIGINT,
    avg_pnl NUMERIC,
    total_pnl NUMERIC,
    avg_risk_reward NUMERIC,
    win_rate NUMERIC,
    best_performing_model TEXT,
    most_traded_symbol TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
        COUNT(CASE WHEN pnl < 0 THEN 1 END) as losing_trades,
        AVG(pnl) as avg_pnl,
        SUM(pnl) as total_pnl,
        AVG(risk_reward_ratio) as avg_risk_reward,
        (COUNT(CASE WHEN pnl > 0 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100) as win_rate,
        (SELECT model_used FROM ict_trades WHERE pnl IS NOT NULL GROUP BY model_used ORDER BY AVG(pnl) DESC LIMIT 1) as best_performing_model,
        (SELECT symbol FROM ict_trades GROUP BY symbol ORDER BY COUNT(*) DESC LIMIT 1) as most_traded_symbol
    FROM ict_trades
    WHERE pnl IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_model_performance()
RETURNS TABLE (
    model_name TEXT,
    total_trades BIGINT,
    winning_trades BIGINT,
    win_rate NUMERIC,
    avg_pnl NUMERIC,
    total_pnl NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.model_used as model_name,
        COUNT(*) as total_trades,
        COUNT(CASE WHEN t.pnl > 0 THEN 1 END) as winning_trades,
        (COUNT(CASE WHEN t.pnl > 0 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100) as win_rate,
        AVG(t.pnl) as avg_pnl,
        SUM(t.pnl) as total_pnl
    FROM ict_trades t
    WHERE t.model_used IS NOT NULL AND t.pnl IS NOT NULL
    GROUP BY t.model_used
    ORDER BY win_rate DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_pattern_analysis()
RETURNS TABLE (
    pattern_name TEXT,
    total_trades BIGINT,
    winning_trades BIGINT,
    win_rate NUMERIC,
    avg_pnl NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.pattern_identified as pattern_name,
        COUNT(*) as total_trades,
        COUNT(CASE WHEN t.pnl > 0 THEN 1 END) as winning_trades,
        (COUNT(CASE WHEN t.pnl > 0 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100) as win_rate,
        AVG(t.pnl) as avg_pnl
    FROM ict_trades t
    WHERE t.pattern_identified IS NOT NULL AND t.pnl IS NOT NULL
    GROUP BY t.pattern_identified
    ORDER BY win_rate DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_time_window_analysis()
RETURNS TABLE (
    time_window TEXT,
    total_trades BIGINT,
    winning_trades BIGINT,
    win_rate NUMERIC,
    avg_pnl NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.time_window as time_window,
        COUNT(*) as total_trades,
        COUNT(CASE WHEN t.pnl > 0 THEN 1 END) as winning_trades,
        (COUNT(CASE WHEN t.pnl > 0 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100) as win_rate,
        AVG(t.pnl) as avg_pnl
    FROM ict_trades t
    WHERE t.time_window IS NOT NULL AND t.pnl IS NOT NULL
    GROUP BY t.time_window
    ORDER BY win_rate DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_monthly_performance()
RETURNS TABLE (
    month_year TEXT,
    total_trades BIGINT,
    winning_trades BIGINT,
    win_rate NUMERIC,
    total_pnl NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(t.trade_date, 'YYYY-MM') as month_year,
        COUNT(*) as total_trades,
        COUNT(CASE WHEN t.pnl > 0 THEN 1 END) as winning_trades,
        (COUNT(CASE WHEN t.pnl > 0 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100) as win_rate,
        SUM(t.pnl) as total_pnl
    FROM ict_trades t
    WHERE t.pnl IS NOT NULL
    GROUP BY TO_CHAR(t.trade_date, 'YYYY-MM')
    ORDER BY month_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_embeddings(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.8,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id int,
    content text,
    metadata jsonb,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.content,
        e.metadata,
        1 - (e.embedding <=> query_embedding) as similarity
    FROM embeddings e
    WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;