-- =====================================================
-- ICT COMPREHENSIVE DATABASE SCHEMA
-- Complete Production-Ready SQL Implementation
-- 
-- Based on:
-- - ict_core.csv (21+ ICT concepts and definitions)
-- - ict_schema_query_base.json (Trading models, patterns, techniques)
-- 
-- Features:
-- - Complete table definitions with all ICT concepts
-- - Sample data population from reference files
-- - Performance-optimized indexes and constraints
-- - Advanced analytics views and functions
-- - Professional trading operation support
-- =====================================================

-- Drop existing tables if they exist (for clean deployment)
DROP TABLE IF EXISTS ict_trades CASCADE;
DROP TABLE IF EXISTS ict_time_windows CASCADE;
DROP TABLE IF EXISTS ict_patterns CASCADE;
DROP TABLE IF EXISTS ict_entry_techniques CASCADE;
DROP TABLE IF EXISTS ict_trading_models CASCADE;
DROP TABLE IF EXISTS ict_definitions CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS ict_performance_summary CASCADE;
DROP VIEW IF EXISTS ict_performance_by_model CASCADE;
DROP VIEW IF EXISTS ict_performance_by_technique CASCADE;
DROP VIEW IF EXISTS ict_performance_by_time CASCADE;
DROP VIEW IF EXISTS ict_confluence_analysis CASCADE;
DROP VIEW IF EXISTS ict_performance_by_asset CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS calculate_sharpe_ratio(DECIMAL);
DROP FUNCTION IF EXISTS calculate_max_drawdown();
DROP FUNCTION IF EXISTS calculate_trade_metrics();
DROP FUNCTION IF EXISTS validate_confluence_data();
DROP FUNCTION IF EXISTS update_performance_stats();
DROP FUNCTION IF EXISTS optimize_ict_tables();
DROP FUNCTION IF EXISTS cleanup_test_trades(INTEGER);

-- =====================================================
-- 1. CORE TABLE DEFINITIONS
-- =====================================================

-- 1.1 ICT Definitions Table
-- Stores all ICT concepts from ict_core.csv
CREATE TABLE ict_definitions (
    definition_id           SERIAL PRIMARY KEY,
    concept_name            VARCHAR(100) NOT NULL UNIQUE,
    definition_text         TEXT NOT NULL,
    key_characteristics     TEXT,
    typical_confirmation    TEXT,
    trading_rule           TEXT,
    common_mistake         TEXT,
    related_concepts       TEXT,
    ict_entry_technique    VARCHAR(100),
    ict_price_action_model VARCHAR(100),
    chart_example          TEXT,
    concept_category       VARCHAR(50) NOT NULL,
    concept_type           VARCHAR(50),
    complexity_level       SMALLINT CHECK (complexity_level BETWEEN 1 AND 5),
    created_at             TIMESTAMP DEFAULT NOW(),
    updated_at             TIMESTAMP DEFAULT NOW()
);

-- 1.2 Trading Models Table
-- Stores all trading models from ict_schema_query_base.json
CREATE TABLE ict_trading_models (
    model_id               SERIAL PRIMARY KEY,
    model_name             VARCHAR(100) NOT NULL UNIQUE,
    model_category         VARCHAR(50) NOT NULL,
    model_type             VARCHAR(50),
    definition             TEXT NOT NULL,
    key_characteristics    TEXT,
    setup_conditions       TEXT,
    entry_criteria         TEXT,
    confirmation_rules     TEXT,
    exit_strategy          TEXT,
    success_rate           NUMERIC(5,2) CHECK (success_rate BETWEEN 0 AND 100),
    risk_reward_ratio      NUMERIC(6,2) CHECK (risk_reward_ratio > 0),
    complexity_level       SMALLINT CHECK (complexity_level BETWEEN 1 AND 5),
    common_mistakes        TEXT,
    related_concepts       TEXT,
    chart_examples         TEXT,
    created_at             TIMESTAMP DEFAULT NOW(),
    updated_at             TIMESTAMP DEFAULT NOW()
);

-- 1.3 Entry Techniques Table
-- Stores all entry techniques from ict_schema_query_base.json
CREATE TABLE ict_entry_techniques (
    technique_id           SERIAL PRIMARY KEY,
    technique_name         VARCHAR(100) NOT NULL UNIQUE,
    technique_category     VARCHAR(50) NOT NULL,
    definition             TEXT NOT NULL,
    key_characteristics    TEXT,
    setup_requirements     TEXT,
    entry_conditions       TEXT,
    confirmation_steps     TEXT,
    stop_loss_placement    TEXT,
    take_profit_targets    TEXT,
    success_rate           NUMERIC(5,2) CHECK (success_rate BETWEEN 0 AND 100),
    avg_risk_reward        NUMERIC(6,2) CHECK (avg_risk_reward > 0),
    complexity_level       SMALLINT CHECK (complexity_level BETWEEN 1 AND 5),
    common_errors          TEXT,
    related_models         TEXT,
    documentation          TEXT,
    created_at             TIMESTAMP DEFAULT NOW(),
    updated_at             TIMESTAMP DEFAULT NOW()
);

-- 1.4 Patterns Table
-- Stores all patterns from ict_schema_query_base.json
CREATE TABLE ict_patterns (
    pattern_id             SERIAL PRIMARY KEY,
    pattern_name           VARCHAR(100) NOT NULL UNIQUE,
    pattern_category       VARCHAR(50) NOT NULL,
    pattern_type           VARCHAR(50),
    definition             TEXT NOT NULL,
    recognition_rules      TEXT,
    formation_criteria     TEXT,
    trading_application    TEXT,
    success_indicators     TEXT,
    failure_signals        TEXT,
    related_concepts       TEXT,
    examples               TEXT,
    complexity_level       SMALLINT CHECK (complexity_level BETWEEN 1 AND 5),
    created_at             TIMESTAMP DEFAULT NOW(),
    updated_at             TIMESTAMP DEFAULT NOW()
);

-- 1.5 Time Windows Table
-- Stores ICT-specific trading sessions and macro times
CREATE TABLE ict_time_windows (
    window_id              SERIAL PRIMARY KEY,
    window_name            VARCHAR(100) NOT NULL UNIQUE,
    window_type            VARCHAR(50) NOT NULL,
    session                VARCHAR(30) NOT NULL,
    start_time             TIME NOT NULL,
    end_time               TIME NOT NULL,
    timezone               VARCHAR(10) NOT NULL,
    description            TEXT,
    characteristics        TEXT,
    probability_rating     SMALLINT CHECK (probability_rating BETWEEN 1 AND 5),
    optimal_pairs          TEXT,
    success_rate           NUMERIC(5,2) CHECK (success_rate BETWEEN 0 AND 100),
    avg_volatility         NUMERIC(8,4),
    documentation          TEXT,
    created_at             TIMESTAMP DEFAULT NOW(),
    updated_at             TIMESTAMP DEFAULT NOW()
);

-- 1.6 Comprehensive Trades Table
-- Main table for tracking all ICT trades with complete analysis
CREATE TABLE ict_trades (
    trade_id               SERIAL PRIMARY KEY,
    asset                  VARCHAR(20) NOT NULL,
    
    -- Market Bias Analysis
    htf_bias               VARCHAR(10) NOT NULL CHECK (htf_bias IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    ltf_bias               VARCHAR(10) NOT NULL CHECK (ltf_bias IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    htf_timeframe          VARCHAR(10) NOT NULL,
    ltf_timeframe          VARCHAR(10) NOT NULL,
    
    -- ICT Model and Technique References
    trading_model_id       INT REFERENCES ict_trading_models(model_id),
    entry_technique_id     INT REFERENCES ict_entry_techniques(technique_id),
    time_window_id         INT REFERENCES ict_time_windows(window_id),
    
    -- Applied ICT Concepts (JSON arrays for flexibility)
    applied_concepts       JSONB, -- Array of concept names from ict_definitions
    applied_patterns       JSONB, -- Array of pattern names from ict_patterns
    confluence_factors     JSONB, -- Array of confluence factor details
    
    -- Market Structure Analysis
    market_structure       VARCHAR(30), -- BOS, CHoCH, Continuation, Reversal
    displacement_type      VARCHAR(20), -- Strong, Weak, None
    liquidity_sweep        VARCHAR(50), -- BSL, SSL, EQH, EQL, None
    smt_divergence         VARCHAR(20), -- Type 1, Type 2, None
    pd_array_position      VARCHAR(20), -- Premium, Discount, Equilibrium
    
    -- Price Levels and Risk Management
    direction              VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    entry_price            NUMERIC(12,6),
    stop_loss              NUMERIC(12,6) NOT NULL,
    take_profit_1          NUMERIC(12,6),
    take_profit_2          NUMERIC(12,6),
    take_profit_3          NUMERIC(12,6),
    exit_price             NUMERIC(12,6),
    
    -- Position Sizing and Risk
    account_balance        NUMERIC(15,2),
    risk_percent           NUMERIC(5,2) NOT NULL CHECK (risk_percent > 0 AND risk_percent <= 10),
    position_size          NUMERIC(15,4),
    risk_reward_ratio      NUMERIC(6,2),
    
    -- Confluence Analysis
    confluence_score       SMALLINT NOT NULL CHECK (confluence_score BETWEEN 0 AND 10),
    star_rating            SMALLINT CHECK (star_rating BETWEEN 1 AND 5),
    
    -- Timing Information
    setup_time             TIMESTAMP NOT NULL,
    entry_time             TIMESTAMP,
    exit_time              TIMESTAMP,
    trade_status           VARCHAR(15) DEFAULT 'SETUP' CHECK (trade_status IN ('SETUP', 'ENTERED', 'CLOSED', 'CANCELLED')),
    
    -- Performance Tracking
    pnl_points             NUMERIC(10,4),
    pnl_percent            NUMERIC(8,2),
    pnl_dollar             NUMERIC(12,2),
    max_favorable_excursion NUMERIC(10,4),
    max_adverse_excursion  NUMERIC(10,4),
    
    -- Trade Quality Metrics
    execution_quality      SMALLINT CHECK (execution_quality BETWEEN 1 AND 10),
    timing_quality         SMALLINT CHECK (timing_quality BETWEEN 1 AND 10),
    
    -- Documentation and Learning
    chart_screenshot       TEXT,
    trade_notes            TEXT,
    lessons_learned        TEXT,
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT NOW(),
    updated_at             TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. SAMPLE DATA POPULATION
-- =====================================================

-- 2.1 ICT Definitions (from ict_core.csv)
INSERT INTO ict_definitions (concept_name, definition_text, key_characteristics, typical_confirmation, trading_rule, common_mistake, related_concepts, concept_category, concept_type, complexity_level) VALUES

-- Core ICT Concepts
('Order Block', 'A price level where institutional orders are placed, creating significant support or resistance zones that often get revisited', 'Strong rejection at level, High volume node, Clear structure break before formation, Mitigation through the block', 'Price rejection with wicks, Volume spike confirmation, Mitigation through the block, Follow-through after test', 'Wait for mitigation before entry, Use proper risk management, Confirm with higher timeframe bias, Enter on rejection', 'Entering too early before mitigation, Ignoring higher timeframe context, Poor risk management, Trading every order block', 'Fair Value Gap, Breaker Block, Mitigation Block, Liquidity Pool, Premium/Discount Arrays', 'Price Action', 'Support/Resistance', 3),

('Fair Value Gap', 'An imbalance in price where one candle body does not overlap with previous or next candle bodies, creating a gap that often gets filled', 'Clear gap in price action, No overlapping bodies, Often gets filled later, Created by strong moves', 'Gap formation on strong move, Volume confirmation, Directional bias alignment, Partial fill behavior', 'Trade gap fills at 62-79% retracement, Use as support/resistance after fill, Combine with other confluences', 'Trading every gap without context, Ignoring market structure, Poor timing on entries, Not waiting for confirmation', 'Order Block, Liquidity Void, Imbalance, Premium/Discount Arrays, Optimal Trade Entry', 'Price Action', 'Imbalance', 2),

('Break of Structure', 'When price breaks a significant swing high or low, indicating potential change in market direction or trend continuation', 'Clear break of previous structure, Volume confirmation, Follow-through momentum, No immediate reversal', 'Structure break with volume, Momentum continuation, No immediate pullback, Follow-through candle', 'Wait for confirmation candle, Trade pullbacks after BOS, Manage risk properly, Use higher timeframe context', 'False breakouts, Entering too early, Ignoring overall context, Poor risk management', 'Change of Character, Market Structure, Liquidity Sweep, Displacement, Order Block', 'Market Structure', 'Trend Change', 3),

('Change of Character', 'A shift in market behavior indicating potential reversal or continuation pattern, often preceding major moves', 'Momentum shift visible, Structure change, Volume pattern changes, Behavior modification', 'Momentum divergence, Structure break, Volume confirmation, Follow-through behavior', 'Identify early signs, Prepare for reversal, Use proper confirmation, Wait for structure break', 'Premature entries, Ignoring confirmation signals, Poor risk management, Missing the setup', 'Break of Structure, Market Structure, Displacement, Smart Money Concepts', 'Market Structure', 'Trend Change', 4),

('Liquidity Sweep', 'When price moves to take out stops above/below key levels before reversing direction, hunting liquidity', 'Quick move to liquidity, Immediate reversal, High volume spike, Stop hunt behavior', 'Stop hunt completion, Reversal confirmation, Volume spike on sweep, Immediate rejection', 'Wait for sweep completion, Enter on reversal confirmation, Use tight stops, Quick execution', 'Entering during the sweep, Poor timing, Inadequate confirmation, Missing reversal signals', 'Stop Hunt, Liquidity Pool, False Breakout, Order Block, Market Maker Models', 'Liquidity', 'Stop Hunt', 4),

('Premium/Discount Arrays', 'Fibonacci-based value zones where Premium is 70-100% and Discount is 0-30% of a range for optimal entries', 'Clear percentage levels, Optimal entry zones, Risk/reward optimization, Value-based entries', 'Price in correct PD array, Confluence with other factors, Proper risk/reward setup', 'Enter in discount for longs, premium for shorts, Use for position sizing, Combine with structure', 'Entering outside optimal zones, Ignoring PD array context, Poor risk/reward ratios', 'Optimal Trade Entry, Fair Value Gap, Order Block, Fibonacci Retracements', 'Value Zones', 'Entry Optimization', 2),

('Kill Zone', 'High-probability trading windows during specific market sessions when institutional activity is highest', 'Specific time windows, High volatility periods, Institutional activity, Session-based', 'Time-based confirmation, Increased volatility, Clear directional moves, Volume increase', 'Trade only during kill zones, Wait for optimal timing, Use session bias, Prepare in advance', 'Trading outside optimal windows, Ignoring session characteristics, Poor preparation', 'Silver Bullet, Macro Times, Session Analysis, Time-based Analysis', 'Timing', 'Session Analysis', 2),

('Silver Bullet', 'Precision 20-minute window (10:00-11:00 EST) for high-probability trade execution with algorithmic moves', 'Exact timing window, Algorithmic price moves, High success rate, Precision required', 'Precise timing alignment, Strong directional move, Volume confirmation, Clean execution', 'Enter only during silver bullet time, Use tight execution, Manage risk strictly, Prepare setup in advance', 'Missing the timing window, Poor execution, Inadequate preparation, Wrong bias', 'Kill Zone, Macro Times, Precision Trading, Algorithmic Trading', 'Timing', 'Precision Entry', 3),

('Displacement', 'Strong impulsive move indicating institutional participation and market direction change', 'Sudden strong price move, High volume, Clear direction, Institutional footprint', 'Strong momentum candle, Volume spike, Follow-through, No immediate retracement', 'Use as trend confirmation, Enter on pullbacks, Follow displacement direction, Wait for pullback', 'Missing displacement signals, Counter-trend trading, Poor follow-through, Entering too late', 'Order Block, Market Structure, Institutional Flow, Smart Money Concepts', 'Institutional Flow', 'Momentum', 3),

('Optimal Trade Entry', 'Fibonacci 61.8%-79% retracement zone for precision entries with 70.5% being the optimal level', 'Specific percentage levels, High probability zone, Risk/reward optimization, Precision entries', 'OTE level alignment, Confluence with FVG/OB, Proper market structure, Multiple confirmations', 'Enter at 70.5% optimal level, Combine with other confluences, Use for precision, Wait for confirmation', 'Entering outside OTE zone, Ignoring confluence factors, Poor timing, Inadequate confirmation', 'Fair Value Gap, Order Block, Premium/Discount Arrays, Fibonacci Analysis', 'Entry Models', 'Precision Entry', 3),

('Breaker Block', 'A failed order block that becomes support/resistance after being broken, often stronger than original OB', 'Failed order block, Becomes opposite polarity, Stronger than original, Role reversal', 'Break of order block, Role reversal confirmation, Price acceptance, Volume confirmation', 'Wait for role reversal, Use as new support/resistance, Combine with other factors', 'Trading too early, Ignoring role reversal, Poor confirmation', 'Order Block, Mitigation Block, Support/Resistance', 'Price Action', 'Support/Resistance', 4),

('Mitigation Block', 'When price returns to mitigate an order block or imbalance before continuing in the intended direction', 'Return to previous level, Mitigation process, Continuation setup, Rebalancing', 'Price return to level, Mitigation completion, Continuation signals, Volume behavior', 'Wait for mitigation completion, Enter on continuation, Use proper confirmation', 'Entering during mitigation, Poor timing, Missing continuation', 'Order Block, Fair Value Gap, Rebalancing', 'Price Action', 'Mitigation', 3),

('Liquidity Pool', 'Areas where stops are clustered, typically above/below significant highs/lows, targeted by smart money', 'Stop clusters, Above/below extremes, Smart money targets, High probability areas', 'Stop placement patterns, Liquidity identification, Smart money behavior', 'Identify liquidity areas, Wait for sweeps, Enter on reversals, Use as targets', 'Missing liquidity, Poor identification, Wrong timing', 'Liquidity Sweep, Stop Hunt, Smart Money Concepts', 'Liquidity', 'Stop Clusters', 3),

('Market Structure', 'The overall framework of higher highs/lows and lower highs/lows that defines trend direction', 'Higher highs/lows for uptrend, Lower highs/lows for downtrend, Structure breaks, Trend definition', 'Clear structure pattern, Break confirmations, Trend continuation/reversal signals', 'Follow market structure, Trade with structure, Wait for breaks, Use for bias', 'Counter-structure trading, Ignoring breaks, Poor structure identification', 'Break of Structure, Change of Character, Trend Analysis', 'Market Structure', 'Trend Analysis', 2),

('Smart Money Concepts', 'Understanding how institutional traders move markets through accumulation, manipulation, and distribution', 'Institutional behavior, Market manipulation, Three-phase process, Smart money footprints', 'Institutional activity signs, Manipulation patterns, Distribution signals', 'Follow smart money, Identify manipulation, Trade with institutions, Avoid retail traps', 'Fighting institutions, Retail thinking, Poor timing, Missing manipulation', 'AMD Model, PO3 Model, Institutional Flow', 'Institutional Flow', 'Market Psychology', 4),

('Judas Swing', 'A false move designed to trap retail traders before the real move begins, typically in opposite direction', 'False breakout, Retail trap, Opposite direction move, Manipulation tactic', 'False break, Quick reversal, Volume patterns, Trap completion', 'Identify false moves, Wait for reversal, Enter on true direction, Avoid traps', 'Falling for traps, Poor identification, Wrong timing, Retail thinking', 'Market Manipulation, False Breakout, Smart Money Concepts', 'Market Psychology', 'Manipulation', 4),

('Accumulation', 'Phase where smart money quietly builds positions without moving price significantly', 'Sideways price action, Low volatility, Smart money building, Preparation phase', 'Range formation, Low volume, Consolidation patterns, Preparation signs', 'Identify accumulation, Prepare for breakout, Wait for manipulation, Follow smart money', 'Missing accumulation, Poor identification, Premature entries', 'AMD Model, Smart Money Concepts, Distribution', 'Institutional Flow', 'Market Phase', 3),

('Manipulation', 'Phase where smart money moves price to trigger stops and create liquidity before the real move', 'False moves, Stop hunting, Liquidity creation, Retail trapping', 'False breakouts, Stop sweeps, Liquidity grabs, Reversal signals', 'Identify manipulation, Wait for completion, Enter on reversal, Avoid traps', 'Falling for manipulation, Poor timing, Retail thinking', 'Judas Swing, Liquidity Sweep, Smart Money Concepts', 'Market Psychology', 'Manipulation', 4),

('Distribution', 'Phase where smart money exits positions while retail enters, often at market tops/bottoms', 'Smart money exit, Retail entry, Market extremes, Position transfer', 'Volume patterns, Retail activity, Smart money exit signs, Market extremes', 'Identify distribution, Avoid retail traps, Exit with smart money, Prepare for reversal', 'Retail thinking, Poor timing, Missing exit signals', 'AMD Model, Smart Money Concepts, Market Tops/Bottoms', 'Institutional Flow', 'Market Phase', 4),

('Power of Three', 'Three-phase market model: Consolidation → Manipulation → Trend, repeating cycle', 'Three distinct phases, Cyclical nature, Predictable pattern, Time-based structure', 'Phase identification, Transition signals, Cycle completion, Time alignment', 'Identify current phase, Prepare for next, Trade with cycle, Use time analysis', 'Wrong phase identification, Poor timing, Missing transitions', 'AMD Model, Market Cycles, Time Analysis', 'Market Models', 'Cyclical Analysis', 3),

('Institutional Order Flow', 'The directional bias and positioning of large institutional traders that drives market movement', 'Large position influence, Directional bias, Market driving force, Institutional footprints', 'Order flow signals, Institutional activity, Directional bias confirmation', 'Follow institutional flow, Identify bias changes, Trade with big money, Avoid counter-flow', 'Counter-flow trading, Missing bias changes, Poor identification', 'Smart Money Concepts, Market Structure, Displacement', 'Institutional Flow', 'Order Flow', 4),

('Session Analysis', 'Understanding how different trading sessions (Asian, London, New York) affect market behavior and opportunities', 'Session characteristics, Time-based behavior, Volatility patterns, Opportunity windows', 'Session transitions, Volatility changes, Behavior patterns, Time-based signals', 'Trade optimal sessions, Use session characteristics, Time entries properly, Avoid low-probability times', 'Wrong session trading, Poor timing, Ignoring characteristics', 'Kill Zone, Silver Bullet, Time Analysis', 'Timing', 'Session-Based', 2);

-- 2.2 Trading Models (from ict_schema_query_base.json)
INSERT INTO ict_trading_models (model_name, model_category, model_type, definition, key_characteristics, setup_conditions, entry_criteria, confirmation_rules, exit_strategy, success_rate, risk_reward_ratio, complexity_level) VALUES

('AMD Model', 'Market Models', 'Session Model', 'Accumulation → Manipulation → Distribution three-phase model for understanding market cycles', 'Three distinct phases, Time-based structure, Institutional flow, Cyclical nature', 'Clear session start, Market structure setup, Bias established, Phase identification', 'Phase alignment, Confluence factors present, Proper timing, Structure confirmation', 'Volume confirmation, Structure break, Momentum follow-through, Phase transition', 'Target next phase completion, Trail stops, Partial profits at phase targets', 68.5, 2.8, 4),

('PO3 Model', 'Market Models', 'Session Model', 'Power of Three: Consolidation → Manipulation → Trend three-phase expansion model', 'Power of Three phases, Expansion after manipulation, Clear structure, Time-based', 'Consolidation phase identified, Manipulation setup, Trend bias clear, Time alignment', 'Manipulation completion, Trend phase entry, Confluence alignment, Structure break', 'Break of consolidation, Volume increase, Momentum confirmation, Follow-through', 'Trend extension targets, Trail stops, Multiple partial exits', 72.3, 3.1, 4),

('2-Bar Reversal', 'Bar Patterns', 'Reversal Pattern', 'Two-candle reversal pattern indicating potential trend change with specific formation rules', 'Two specific candles, Reversal formation, Volume confirmation, Structure interaction', 'Clear trend established, Key level interaction, Reversal setup, Volume present', 'Second bar closes opposite to trend, Confirmation present, Volume spike', 'Volume spike, Follow-through candle, Structure break, Momentum shift', 'Previous structure target, Trail stops, Risk management at key levels', 65.2, 2.4, 2),

('3-Bar Reversal', 'Bar Patterns', 'Reversal Pattern', 'Three-candle reversal pattern with higher probability than 2-bar, more reliable signals', 'Three candle sequence, Higher probability, Multiple confirmations, Stronger signal', 'Established trend, Key level interaction, Multiple confluence factors, Structure setup', 'Third bar confirms reversal, Volume support present, Multiple confirmations', 'Multiple confirmations, Structure break, Momentum shift, Follow-through', 'Multiple targets, Partial profits at levels, Trail stops', 71.8, 2.9, 3),

('4-Bar Continuation', 'Bar Patterns', 'Continuation Pattern', 'Four-candle continuation pattern confirming trend direction with pullback structure', 'Four candle sequence, Trend continuation, Pullback structure, Momentum resumption', 'Strong trend established, Pullback formation, Continuation setup, Structure intact', 'Fourth bar confirms continuation, Momentum resumption, Structure holds', 'Trend resumption, Volume confirmation, Structure integrity, Momentum increase', 'Trend targets, Extension levels, Trail with trend', 69.4, 2.7, 3),

('8-Bar Accumulation/Distribution', 'Bar Patterns', 'Accumulation Pattern', 'Eight-candle pattern showing accumulation or distribution phase with institutional activity', 'Eight candle formation, Institutional activity, Accumulation/distribution, Range behavior', 'Range formation, Institutional signs, Accumulation/distribution setup, Time factor', 'Eighth bar completion, Breakout preparation, Volume increase, Direction confirmation', 'Range break, Volume confirmation, Institutional follow-through, Momentum', 'Range projection targets, Breakout objectives, Trail stops', 74.6, 3.2, 4),

('Buy Model A - OB Pullback + FVG Fill', 'Buy Models', 'Bullish Setup', 'Bullish setup combining order block pullback with fair value gap fill for optimal long entries', 'Bullish bias, Order block present, FVG alignment, Multiple confluences', 'Bullish market structure, Order block identified, FVG present, Bias alignment', 'Pullback to OB level, FVG fill begins, Confirmation signals present', 'Rejection at OB, Volume confirmation, Structure alignment, FVG behavior', 'Liquidity targets above, Trail stops, Partial exits at resistance', 74.1, 3.3, 3),

('Buy Model B - Displacement + Pullback', 'Buy Models', 'Bullish Setup', 'Bullish model using displacement followed by pullback to key level for entry', 'Strong displacement, Pullback formation, Bullish bias, Momentum setup', 'Strong bullish displacement, Clear pullback, Key level identified, Bias confirmed', 'Pullback completion, Key level hold, Entry trigger, Confirmation present', 'Level holds, Volume confirmation, Momentum resumption, Follow-through', 'Displacement targets, Extension levels, Trail with momentum', 71.7, 3.0, 3),

('Buy Model C - Liquidity Sweep + Reversal', 'Buy Models', 'Bullish Setup', 'Bullish setup after liquidity sweep below key level followed by strong reversal', 'Liquidity sweep, Strong reversal, Bullish bias, Stop hunt completion', 'Liquidity identified below, Sweep setup, Reversal potential, Bias alignment', 'Sweep completion, Reversal begins, Confirmation signals, Volume spike', 'Reversal confirmation, Volume increase, Follow-through, Structure break', 'Opposite liquidity targets, Quick profits, Trail stops', 76.8, 3.5, 4),

('Sell Model A - OB Short Pullback', 'Sell Models', 'Bearish Setup', 'Bearish setup using order block pullback for short entries with proper confirmation', 'Bearish bias, Bearish order block, Structure break, Pullback formation', 'Bearish market structure, Order block formation, Break confirmed, Pullback setup', 'Pullback to OB level, Rejection confirmation, Entry trigger, Volume present', 'Volume confirmation, Follow-through, Structure alignment, Momentum down', 'Support level targets, Risk management, Trail stops below', 69.7, 2.9, 3),

('Sell Model B - Liquidity Sweep Short', 'Sell Models', 'Bearish Setup', 'Bearish model after liquidity sweep above key level followed by strong bearish reversal', 'Liquidity sweep above, Bearish reversal, Short bias, Stop hunt pattern', 'Liquidity above identified, Sweep setup, Bearish bias, Reversal potential', 'Sweep completion above, Reversal begins, Confirmation signals, Volume spike', 'Strong reversal, Volume confirmation, Follow-through down, Structure break', 'Lower liquidity targets, Quick profits, Trail with momentum', 73.4, 3.2, 4);

-- 2.3 Entry Techniques (from ict_schema_query_base.json)
INSERT INTO ict_entry_techniques (technique_name, technique_category, definition, key_characteristics, setup_requirements, entry_conditions, confirmation_steps, stop_loss_placement, take_profit_targets, success_rate, avg_risk_reward, complexity_level) VALUES

('Order Block Mitigation Entry', 'Pullback Entry', 'Entry technique using order block mitigation for precision entries with institutional level confirmation', 'Order block present, Mitigation setup, Confluence factors, Institutional behavior', 'Valid order block identified, Market structure alignment, Proper bias established, Multiple confluences', 'Price reaches OB level, Mitigation begins, Confirmation present, Volume behavior', 'Rejection at OB level, Volume confirmation, Follow-through candle, Structure integrity', 'Beyond order block boundary, Risk management priority, Structure-based placement', 'Liquidity levels above/below, Structure targets, Multiple partial exits', 73.2, 3.1, 3),

('Fair Value Gap Fill Entry', 'Retracement Entry', 'Entry using fair value gap fill for optimal risk/reward with imbalance correction', 'FVG present, Fill setup, Directional bias, Imbalance correction', 'Valid FVG identified, Market structure support, Bias alignment, Proper timeframe', 'Price approaches FVG, Fill begins, Confirmation signals, Proper behavior', 'Partial fill confirmation, Volume behavior, Rejection signals, Follow-through', 'Beyond FVG boundary, Proper risk management, Structure consideration', 'Previous structure levels, Extension targets, Partial profit taking', 68.9, 2.8, 2),

('Break of Structure Pullback Entry', 'Continuation Entry', 'Entry on pullback after confirmed break of structure for trend continuation trades', 'BOS confirmed, Pullback setup, Trend continuation, Structure integrity', 'Clear BOS established, Structure break confirmed, Pullback formation, Trend intact', 'Pullback to key level, Support/resistance test, Entry trigger, Confirmation', 'Level holds firm, Volume confirmation, Continuation signal, Momentum resumption', 'Below pullback level, Structure-based stop, Risk management priority', 'Extension targets, Trend continuation levels, Trail stops with trend', 71.5, 3.0, 3),

('Liquidity Sweep Entry', 'Reversal Entry', 'Entry after liquidity sweep completion and reversal confirmation for high-probability reversals', 'Liquidity sweep, Reversal setup, High probability, Stop hunt completion', 'Liquidity identified, Sweep setup confirmed, Reversal potential, Proper bias', 'Sweep completion, Reversal begins, Confirmation present, Volume spike', 'Reversal confirmation, Volume spike behavior, Follow-through, Structure break', 'Beyond sweep level, Tight stops required, Quick invalidation', 'Opposite liquidity pools, Reversal targets, Quick profit objectives', 76.3, 3.4, 4),

('BOS Pullback Entry', 'Continuation Entry', 'Specific entry technique for trading pullbacks after break of structure confirmation', 'Structure break, Pullback formation, Continuation setup, Trend alignment', 'Clear structure break, Pullback to key area, Trend continuation bias', 'Pullback completion, Key level test, Entry signal, Confirmation candle', 'Key level holds, Volume confirmation, Continuation signal, Momentum', 'Below key level, Structure-based, Risk management', 'Structure targets, Trend objectives, Trail stops', 70.8, 2.9, 3),

('Pullback to Order Block Entry', 'Pullback Entry', 'Entry technique focusing on pullbacks to order block levels for institutional-level entries', 'Order block level, Pullback setup, Institutional behavior, Key level test', 'Order block identified, Pullback formation, Proper market bias, Structure support', 'Pullback to OB, Level test, Rejection signals, Entry confirmation', 'Level rejection, Volume confirmation, Follow-through, Structure integrity', 'Beyond order block, Proper risk placement, Structure consideration', 'Liquidity targets, Structure objectives, Partial exits', 72.4, 3.0, 3),

('Breaker Block Reversal Entry', 'Reversal Entry', 'Entry using breaker block formation after order block failure for role reversal trades', 'Failed order block, Role reversal, Breaker formation, Polarity change', 'Order block failure, Role reversal setup, Breaker block formation, New polarity', 'Role reversal confirmation, New support/resistance, Entry signal', 'Role reversal confirmed, Volume support, Follow-through, New polarity active', 'Beyond breaker level, Role-based stop, Risk management', 'Opposite structure, Role reversal targets, New polarity objectives', 69.1, 2.8, 4),

('Mitigation Block Confirmation Entry', 'Confirmation Entry', 'Entry after mitigation block confirmation for continuation trades with rebalancing', 'Mitigation process, Block confirmation, Continuation setup, Rebalancing complete', 'Mitigation identified, Block formation, Continuation bias, Proper structure', 'Mitigation completion, Block confirmation, Entry signal, Continuation setup', 'Mitigation confirmed, Volume behavior, Continuation signal, Follow-through', 'Beyond mitigation level, Continuation-based stop, Risk management', 'Continuation targets, Structure objectives, Trend levels', 67.5, 2.7, 3),

('Displacement Breakout Entry', 'Breakout Entry', 'Entry on displacement breakout for momentum trades with institutional participation', 'Strong displacement, Breakout formation, Momentum setup, Institutional activity', 'Displacement setup, Breakout preparation, Momentum bias, Institutional signs', 'Displacement occurs, Breakout confirmation, Entry signal, Volume spike', 'Strong displacement, Volume confirmation, Momentum follow-through, No retracement', 'Behind displacement, Momentum-based stop, Quick invalidation', 'Displacement targets, Momentum objectives, Extension levels', 74.7, 3.3, 3),

('Silver Bullet 20-min Entry', 'Precision Entry', 'Precision entry during 20-minute silver bullet window for algorithmic-level accuracy', 'Exact timing window, Algorithmic moves, Precision required, High probability', 'Silver bullet time, Setup prepared, Bias established, Confluence present', 'Timing window active, Setup triggers, Entry signal, Precision execution', 'Timing confirmation, Setup validation, Entry execution, Follow-through', 'Time-based stop, Precision placement, Quick invalidation if wrong', 'Algorithmic targets, Precision objectives, Time-based exits', 81.2, 3.8, 4),

('MTA (Multiple-TF Alignment) Entry', 'Multi-Timeframe Entry', 'Entry using multiple timeframe alignment for high-confluence trade setups', 'Multiple timeframes, Alignment setup, High confluence, Structure harmony', 'Multiple TF analysis, Alignment identified, Confluence factors, Structure agreement', 'All timeframes align, Entry signal, Confluence confirmation, Structure support', 'Multi-TF confirmation, Alignment verified, Entry validation, Structure integrity', 'Multi-TF based stop, Alignment consideration, Structure placement', 'Multi-TF targets, Alignment objectives, Structure-based exits', 78.9, 3.6, 4);

-- 2.4 Patterns (from ict_schema_query_base.json)
INSERT INTO ict_patterns (pattern_name, pattern_category, pattern_type, definition, recognition_rules, formation_criteria, trading_application, success_indicators, failure_signals, related_concepts, complexity_level) VALUES

('2x2 Pattern', 'Grid Patterns', 'Continuation Pattern', 'Two-by-two candle formation indicating continuation with specific structure requirements', 'Four candle formation, 2x2 grid structure, Continuation bias, Specific formation rules', 'Two up, two down OR two down, two up formation, Proper structure, Trend context', 'Trade continuation direction, Use for trend confirmation, Entry after completion', 'Clean formation, Volume confirmation, Continuation follow-through', 'Broken formation, Poor follow-through, Volume divergence', 'Market Structure, Continuation Patterns, Trend Analysis', 2),

('3x3 Pattern', 'Grid Patterns', 'Reversal Pattern', 'Three-by-three candle formation indicating potential reversal with higher complexity', 'Nine candle formation, 3x3 grid structure, Reversal potential, Complex formation', 'Three rows of three candles, Specific formation rules, Reversal context, Structure interaction', 'Trade reversal direction, Use for trend change, Entry after pattern completion', 'Complete formation, Volume increase, Reversal confirmation', 'Incomplete pattern, Poor volume, Failed reversal', 'Reversal Patterns, Market Structure, Complex Formations', 3),

('4x4 Pattern', 'Grid Patterns', 'Complex Pattern', 'Four-by-four candle formation for complex market analysis with institutional implications', 'Sixteen candle formation, 4x4 grid structure, Complex analysis, Institutional behavior', 'Four rows of four candles, Complex formation rules, Institutional context, Advanced structure', 'Advanced pattern recognition, Institutional analysis, Complex trade setups', 'Perfect formation, Strong volume, Institutional confirmation', 'Imperfect formation, Weak volume, Poor institutional follow-through', 'Advanced Patterns, Institutional Analysis, Complex Structures', 4),

('ICT Market Structure (BOS/CHoCH)', 'Market Structure', 'Structural Pattern', 'Break of Structure and Change of Character pattern for market direction analysis', 'Structure breaks, Character changes, Market direction shifts, Trend analysis', 'Clear structure levels, Break confirmation, Character change signals, Trend context', 'Trade structure breaks, Use for bias, Direction confirmation, Trend analysis', 'Clean breaks, Volume confirmation, Follow-through, Character change', 'False breaks, Poor volume, Failed follow-through, No character change', 'Break of Structure, Change of Character, Market Structure', 3),

('Displacement Model', 'Momentum Patterns', 'Impulse Pattern', 'Strong impulsive move pattern indicating institutional participation and market direction', 'Strong impulse move, High volume, Clear direction, Institutional footprint', 'Sudden strong move, Volume spike, Clear direction, No immediate retracement', 'Trade pullbacks to displacement, Use for trend confirmation, Direction bias', 'Strong impulse, High volume, Clean move, No retracement', 'Weak impulse, Poor volume, Immediate retracement, Choppy action', 'Institutional Flow, Smart Money Concepts, Momentum Analysis', 3),

('Liquidity Sweep Pattern', 'Liquidity Patterns', 'Manipulation Pattern', 'Pattern showing liquidity sweep above/below key levels before reversal direction', 'Liquidity identification, Sweep action, Reversal setup, Stop hunt behavior', 'Liquidity above/below, Sweep setup, Quick reversal, Volume spike', 'Trade reversals after sweeps, Use for entry timing, Liquidity targeting', 'Clean sweep, Quick reversal, Volume spike, Follow-through', 'Poor sweep, Slow reversal, Weak volume, No follow-through', 'Liquidity Sweep, Stop Hunt, Market Manipulation', 4),

('Smart Money Consolidation', 'Consolidation Patterns', 'Accumulation Pattern', 'Consolidation pattern showing smart money accumulation before major moves', 'Range formation, Smart money activity, Accumulation signs, Breakout preparation', 'Clear range, Low volatility, Accumulation signs, Smart money footprints', 'Trade breakouts, Use for direction bias, Accumulation analysis', 'Clean range, Accumulation signs, Strong breakout, Volume confirmation', 'Messy range, No accumulation, Weak breakout, Poor volume', 'Smart Money Concepts, Accumulation, Range Analysis', 4);

-- 2.5 Time Windows (ICT-specific trading sessions)
INSERT INTO ict_time_windows (window_name, window_type, session, start_time, end_time, timezone, description, probability_rating, optimal_pairs, success_rate) VALUES

('London Kill Zone', 'Kill Zone', 'London', '02:00:00', '05:00:00', 'EST', 'European session high-probability trading window with strong institutional activity', 4, 'GBPUSD, EURUSD, GBPJPY, EURGBP', 72.5),

('New York Kill Zone', 'Kill Zone', 'New York', '07:00:00', '10:00:00', 'EST', 'NY opening high-probability window with strong moves and high volume', 5, 'EURUSD, GBPUSD, USDCAD, USDCHF', 78.2),

('Silver Bullet', 'Silver Bullet', 'New York', '10:00:00', '11:00:00', 'EST', '20-minute precision window for algorithmic moves with highest probability', 5, 'All major pairs', 81.7),

('Asian Range', 'Consolidation', 'Asian', '20:00:00', '02:00:00', 'EST', 'Range-bound Asian session with lower volatility and consolidation behavior', 2, 'USDJPY, AUDUSD, NZDUSD', 45.3),

('Lunch Time Lull', 'Low Probability', 'New York', '11:00:00', '13:30:00', 'EST', 'Low activity consolidation period with reduced probability', 2, 'Limited trading recommended', 38.9),

('NY PM Session', 'Kill Zone', 'New York', '13:30:00', '16:00:00', 'EST', 'Afternoon continuation or reversal window with moderate probability', 4, 'EURUSD, GBPUSD, USDCAD', 69.8),

('London Close', 'Transition', 'London', '11:00:00', '12:00:00', 'EST', 'London session close with potential reversal or continuation setups', 3, 'GBPUSD, EURUSD', 58.4),

('NY Open Macro', 'Macro Time', 'New York', '08:30:00', '09:30:00', 'EST', 'New York opening macro time with news and economic data impact', 4, 'All USD pairs', 71.2),

('London Open Macro', 'Macro Time', 'London', '03:00:00', '04:00:00', 'EST', 'London opening macro time with European market activity', 4, 'EUR and GBP pairs', 68.7),

('Midnight Open', 'Session Open', 'Global', '00:00:00', '01:00:00', 'EST', 'Daily session reset with potential setup formations', 3, 'All pairs', 52.1);

-- 2.6 Sample Trades (demonstrating the schema capabilities)
INSERT INTO ict_trades (
    asset, htf_bias, ltf_bias, htf_timeframe, ltf_timeframe,
    trading_model_id, entry_technique_id, time_window_id,
    applied_concepts, applied_patterns, confluence_factors,
    market_structure, displacement_type, liquidity_sweep, pd_array_position,
    direction, entry_price, stop_loss, take_profit_1, take_profit_2,
    account_balance, risk_percent, confluence_score, star_rating,
    setup_time, trade_status, trade_notes
) VALUES

-- Sample Trade 1: EURUSD Long using Buy Model A
('EURUSD', 'BULLISH', 'BULLISH', '4H', '15M',
 (SELECT model_id FROM ict_trading_models WHERE model_name = 'Buy Model A - OB Pullback + FVG Fill'),
 (SELECT technique_id FROM ict_entry_techniques WHERE technique_name = 'Order Block Mitigation Entry'),
 (SELECT window_id FROM ict_time_windows WHERE window_name = 'Silver Bullet'),
 '["Order Block", "Fair Value Gap", "Premium/Discount Arrays"]'::jsonb,
 '["ICT Market Structure (BOS/CHoCH)", "Displacement Model"]'::jsonb,
 '["Order Block at 1.0850", "FVG at 1.0845-1.0855", "70.5% OTE Level", "Silver Bullet Timing", "HTF Bullish Structure"]'::jsonb,
 'BOS Confirmed', 'Strong', 'None', 'Discount',
 'LONG', 1.08520, 1.08350, 1.08950, 1.09200,
 10000.00, 2.0, 8, 5,
 '2024-01-15 10:15:00', 'SETUP', 'Perfect confluence setup with all factors aligned. Waiting for Silver Bullet execution.'),

-- Sample Trade 2: GBPUSD Short using Sell Model A
('GBPUSD', 'BEARISH', 'BEARISH', 'Daily', '5M',
 (SELECT model_id FROM ict_trading_models WHERE model_name = 'Sell Model A - OB Short Pullback'),
 (SELECT technique_id FROM ict_entry_techniques WHERE technique_name = 'Liquidity Sweep Entry'),
 (SELECT window_id FROM ict_time_windows WHERE window_name = 'London Kill Zone'),
 '["Order Block", "Liquidity Sweep", "Break of Structure"]'::jsonb,
 '["Liquidity Sweep Pattern", "ICT Market Structure (BOS/CHoCH)"]'::jsonb,
 '["Bearish Order Block at 1.2650", "Liquidity Sweep above 1.2680", "HTF Bearish Structure", "London Kill Zone", "Volume Confirmation"]'::jsonb,
 'CHoCH Confirmed', 'Strong', 'SSL Above 1.2680', 'Premium',
 'SHORT', 1.26450, 1.26750, 1.25800, 1.25200,
 10000.00, 1.5, 7, 4,
 '2024-01-15 03:30:00', 'ENTERED', 'Liquidity sweep completed, entered on reversal confirmation.'),

-- Sample Trade 3: USDJPY Long using 3-Bar Reversal
('USDJPY', 'BULLISH', 'BULLISH', '1H', '5M',
 (SELECT model_id FROM ict_trading_models WHERE model_name = '3-Bar Reversal'),
 (SELECT technique_id FROM ict_entry_techniques WHERE technique_name = 'Fair Value Gap Fill Entry'),
 (SELECT window_id FROM ict_time_windows WHERE window_name = 'NY PM Session'),
 '["Fair Value Gap", "Optimal Trade Entry", "Market Structure"]'::jsonb,
 '["3x3 Pattern", "Displacement Model"]'::jsonb,
 '["3-Bar Reversal Pattern", "FVG Fill at 148.50", "OTE 70.5% Level", "Volume Confirmation"]'::jsonb,
 'Continuation', 'Moderate', 'None', 'Discount',
 'LONG', 148.520, 148.200, 149.100, 149.500,
 10000.00, 2.5, 6, 4,
 '2024-01-15 14:45:00', 'CLOSED', 'Successful 3-bar reversal trade with good follow-through.');

-- =====================================================
-- 3. PERFORMANCE ANALYTICS VIEWS
-- =====================================================

-- 3.1 Overall Performance Summary
CREATE VIEW ict_performance_summary AS
SELECT
    COUNT(*) as total_trades,
    COUNT(CASE WHEN pnl_percent > 0 THEN 1 END) as winning_trades,
    COUNT(CASE WHEN pnl_percent < 0 THEN 1 END) as losing_trades,
    ROUND(
        COUNT(CASE WHEN pnl_percent > 0 THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(CASE WHEN pnl_percent IS NOT NULL THEN 1 END), 0) * 100, 2
    ) as win_rate_percent,
    ROUND(AVG(pnl_percent), 2) as avg_return_percent,
    ROUND(STDDEV(pnl_percent), 2) as return_std_dev,
    ROUND(MAX(pnl_percent), 2) as best_trade_percent,
    ROUND(MIN(pnl_percent), 2) as worst_trade_percent,
    ROUND(
        SUM(CASE WHEN pnl_percent > 0 THEN pnl_percent ELSE 0 END) / 
        NULLIF(ABS(SUM(CASE WHEN pnl_percent < 0 THEN pnl_percent ELSE 0 END)), 0), 2
    ) as profit_factor,
    ROUND(AVG(risk_reward_ratio), 2) as avg_risk_reward,
    ROUND(AVG(confluence_score), 1) as avg_confluence_score
FROM ict_trades 
WHERE trade_status = 'CLOSED' AND pnl_percent IS NOT NULL;

-- 3.2 Performance by Trading Model
CREATE VIEW ict_performance_by_model AS
SELECT
    tm.model_name,
    tm.model_category,
    COUNT(*) as trade_count,
    ROUND(AVG(t.pnl_percent), 2) as avg_return,
    ROUND(
        COUNT(CASE WHEN t.pnl_percent > 0 THEN 1 END)::NUMERIC / 
        COUNT(*) * 100, 2
    ) as win_rate,
    ROUND(
        SUM(CASE WHEN t.pnl_percent > 0 THEN t.pnl_percent ELSE 0 END) / 
        NULLIF(ABS(SUM(CASE WHEN t.pnl_percent < 0 THEN t.pnl_percent ELSE 0 END)), 0), 2
    ) as profit_factor,
    ROUND(AVG(t.star_rating), 1) as avg_rating,
    ROUND(AVG(t.confluence_score), 1) as avg_confluence
FROM ict_trades t
JOIN ict_trading_models tm ON t.trading_model_id = tm.model_id
WHERE t.trade_status = 'CLOSED' AND t.pnl_percent IS NOT NULL
GROUP BY tm.model_id, tm.model_name, tm.model_category
ORDER BY avg_return DESC;

-- 3.3 Performance by Entry Technique
CREATE VIEW ict_performance_by_technique AS
SELECT
    et.technique_name,
    et.technique_category,
    COUNT(*) as trade_count,
    ROUND(AVG(t.pnl_percent), 2) as avg_return,
    ROUND(
        COUNT(CASE WHEN t.pnl_percent > 0 THEN 1 END)::NUMERIC / 
        COUNT(*) * 100, 2
    ) as win_rate,
    ROUND(AVG(t.risk_reward_ratio), 2) as avg_risk_reward,
    ROUND(AVG(t.execution_quality), 1) as avg_execution_quality
FROM ict_trades t
JOIN ict_entry_techniques et ON t.entry_technique_id = et.technique_id
WHERE t.trade_status = 'CLOSED' AND t.pnl_percent IS NOT NULL
GROUP BY et.technique_id, et.technique_name, et.technique_category
ORDER BY avg_return DESC;

-- 3.4 Performance by Time Window
CREATE VIEW ict_performance_by_time AS
SELECT
    tw.window_name,
    tw.window_type,
    tw.session,
    COUNT(*) as trade_count,
    ROUND(AVG(t.pnl_percent), 2) as avg_return,
    ROUND(
        COUNT(CASE WHEN t.pnl_percent > 0 THEN 1 END)::NUMERIC / 
        COUNT(*) * 100, 2
    ) as win_rate,
    ROUND(AVG(t.confluence_score), 1) as avg_confluence,
    ROUND(AVG(t.timing_quality), 1) as avg_timing_quality
FROM ict_trades t
JOIN ict_time_windows tw ON t.time_window_id = tw.window_id
WHERE t.trade_status = 'CLOSED' AND t.pnl_percent IS NOT NULL
GROUP BY tw.window_id, tw.window_name, tw.window_type, tw.session
ORDER BY avg_return DESC;

-- 3.5 Confluence Analysis View
CREATE VIEW ict_confluence_analysis AS
SELECT
    confluence_score,
    COUNT(*) as trade_count,
    ROUND(AVG(pnl_percent), 2) as avg_return,
    ROUND(
        COUNT(CASE WHEN pnl_percent > 0 THEN 1 END)::NUMERIC / 
        COUNT(*) * 100, 2
    ) as win_rate,
    ROUND(AVG(risk_reward_ratio), 2) as avg_risk_reward
FROM ict_trades
WHERE trade_status = 'CLOSED' AND pnl_percent IS NOT NULL
GROUP BY confluence_score
ORDER BY confluence_score DESC;

-- 3.6 Asset Performance Analysis
CREATE VIEW ict_performance_by_asset AS
SELECT
    asset,
    COUNT(*) as trade_count,
    ROUND(AVG(pnl_percent), 2) as avg_return,
    ROUND(
        COUNT(CASE WHEN pnl_percent > 0 THEN 1 END)::NUMERIC / 
        COUNT(*) * 100, 2
    ) as win_rate,
    ROUND(SUM(pnl_dollar), 2) as total_pnl,
    ROUND(AVG(max_favorable_excursion), 2) as avg_mfe,
    ROUND(AVG(max_adverse_excursion), 2) as avg_mae
FROM ict_trades
WHERE trade_status = 'CLOSED' AND pnl_percent IS NOT NULL
GROUP BY asset
ORDER BY total_pnl DESC;

-- =====================================================
-- 4. ADVANCED ANALYTICS FUNCTIONS
-- =====================================================

-- 4.1 Function to calculate Sharpe Ratio
CREATE OR REPLACE FUNCTION calculate_sharpe_ratio(
    risk_free_rate DECIMAL DEFAULT 0.02
) RETURNS DECIMAL AS $$
DECLARE
    avg_return DECIMAL;
    std_dev DECIMAL;
    sharpe_ratio DECIMAL;
BEGIN
    SELECT AVG(pnl_percent), STDDEV(pnl_percent)
    INTO avg_return, std_dev
    FROM ict_trades
    WHERE trade_status = 'CLOSED' AND pnl_percent IS NOT NULL;
    
    IF std_dev > 0 THEN
        sharpe_ratio := (avg_return - risk_free_rate) / std_dev;
    ELSE
        sharpe_ratio := 0;
    END IF;
    
    RETURN ROUND(sharpe_ratio, 4);
END;
$$ LANGUAGE plpgsql;

-- 4.2 Function to calculate Maximum Drawdown
CREATE OR REPLACE FUNCTION calculate_max_drawdown() RETURNS DECIMAL AS $$
DECLARE
    max_dd DECIMAL := 0;
    running_total DECIMAL := 0;
    peak DECIMAL := 0;
    current_dd DECIMAL;
    trade_record RECORD;
BEGIN
    FOR trade_record IN 
        SELECT pnl_percent 
        FROM ict_trades 
        WHERE trade_status = 'CLOSED' AND pnl_percent IS NOT NULL 
        ORDER BY exit_time
    LOOP
        running_total := running_total + trade_record.pnl_percent;
        
        IF running_total > peak THEN
            peak := running_total;
        END IF;
        
        current_dd := peak - running_total;
        
        IF current_dd > max_dd THEN
            max_dd := current_dd;
        END IF;
    END LOOP;
    
    RETURN ROUND(max_dd, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. PERFORMANCE INDEXES
-- =====================================================

-- Core Definitions Table Indexes
CREATE INDEX CONCURRENTLY idx_definitions_concept_name ON ict_definitions(concept_name);
CREATE INDEX CONCURRENTLY idx_definitions_category ON ict_definitions(concept_category);
CREATE INDEX CONCURRENTLY idx_definitions_complexity ON ict_definitions(complexity_level);
CREATE INDEX CONCURRENTLY idx_definitions_type ON ict_definitions(concept_type);

-- Trading Models Table Indexes
CREATE INDEX CONCURRENTLY idx_trading_models_category ON ict_trading_models(model_category);
CREATE INDEX CONCURRENTLY idx_trading_models_success_rate ON ict_trading_models(success_rate DESC);
CREATE INDEX CONCURRENTLY idx_trading_models_risk_reward ON ict_trading_models(risk_reward_ratio DESC);
CREATE INDEX CONCURRENTLY idx_trading_models_complexity ON ict_trading_models(complexity_level);

-- Entry Techniques Table Indexes
CREATE INDEX CONCURRENTLY idx_entry_techniques_category ON ict_entry_techniques(technique_category);
CREATE INDEX CONCURRENTLY idx_entry_techniques_success_rate ON ict_entry_techniques(success_rate DESC);
CREATE INDEX CONCURRENTLY idx_entry_techniques_complexity ON ict_entry_techniques(complexity_level);

-- Patterns Table Indexes
CREATE INDEX CONCURRENTLY idx_patterns_category ON ict_patterns(pattern_category);
CREATE INDEX CONCURRENTLY idx_patterns_type ON ict_patterns(pattern_type);
CREATE INDEX CONCURRENTLY idx_patterns_complexity ON ict_patterns(complexity_level);

-- Time Windows Table Indexes
CREATE INDEX CONCURRENTLY idx_time_windows_session ON ict_time_windows(session);
CREATE INDEX CONCURRENTLY idx_time_windows_type ON ict_time_windows(window_type);
CREATE INDEX CONCURRENTLY idx_time_windows_time_range ON ict_time_windows(start_time, end_time);

-- Trades Table Indexes (Critical for Performance)
CREATE INDEX CONCURRENTLY idx_trades_composite ON ict_trades(asset, trade_status, setup_time);
CREATE INDEX CONCURRENTLY idx_trades_performance ON ict_trades(pnl_percent DESC) WHERE pnl_percent IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_trades_rating ON ict_trades(star_rating DESC);
CREATE INDEX CONCURRENTLY idx_trades_confluence ON ict_trades(confluence_score DESC);
CREATE INDEX CONCURRENTLY idx_trades_model ON ict_trades(trading_model_id);
CREATE INDEX CONCURRENTLY idx_trades_technique ON ict_trades(entry_technique_id);
CREATE INDEX CONCURRENTLY idx_trades_time_window ON ict_trades(time_window_id);
CREATE INDEX CONCURRENTLY idx_trades_setup_date ON ict_trades(DATE(setup_time));
CREATE INDEX CONCURRENTLY idx_trades_exit_date ON ict_trades(DATE(exit_time)) WHERE exit_time IS NOT NULL;

-- Partial Indexes for Active Trading
CREATE INDEX CONCURRENTLY idx_active_trades ON ict_trades(trade_id, asset, setup_time) 
WHERE trade_status IN ('SETUP', 'ENTERED');

CREATE INDEX CONCURRENTLY idx_closed_trades ON ict_trades(exit_time DESC, pnl_percent) 
WHERE trade_status = 'CLOSED';

CREATE INDEX CONCURRENTLY idx_profitable_trades ON ict_trades(pnl_percent DESC, exit_time) 
WHERE pnl_percent > 0;

-- Composite Indexes for Complex Queries
CREATE INDEX CONCURRENTLY idx_trades_analysis ON ict_trades(asset, trading_model_id, confluence_score, star_rating) 
WHERE trade_status = 'CLOSED';

CREATE INDEX CONCURRENTLY idx_trades_risk_analysis ON ict_trades(risk_percent, risk_reward_ratio, pnl_percent) 
WHERE trade_status = 'CLOSED';

-- =====================================================
-- 6. DATA VALIDATION TRIGGERS
-- =====================================================

-- 6.1 Function to automatically calculate trade metrics
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate risk-reward ratio if all required fields are present
    IF NEW.stop_loss IS NOT NULL AND NEW.take_profit_1 IS NOT NULL AND NEW.entry_price IS NOT NULL THEN
        IF NEW.direction = 'LONG' THEN
            NEW.risk_reward_ratio := ABS(NEW.take_profit_1 - NEW.entry_price) / ABS(NEW.entry_price - NEW.stop_loss);
        ELSE
            NEW.risk_reward_ratio := ABS(NEW.entry_price - NEW.take_profit_1) / ABS(NEW.stop_loss - NEW.entry_price);
        END IF;
    END IF;
    
    -- Calculate position size based on risk percentage
    IF NEW.account_balance IS NOT NULL AND NEW.risk_percent IS NOT NULL AND NEW.stop_loss IS NOT NULL AND NEW.entry_price IS NOT NULL THEN
        NEW.position_size := (NEW.account_balance * NEW.risk_percent / 100) / ABS(NEW.entry_price - NEW.stop_loss);
    END IF;
    
    -- Update timestamp
    NEW.updated_at := NOW();
    
    -- Set trade status based on execution
    IF OLD IS NOT NULL AND OLD.trade_status = 'SETUP' AND NEW.entry_time IS NOT NULL THEN
        NEW.trade_status := 'ENTERED';
    END IF;
    
    IF OLD IS NOT NULL AND OLD.trade_status IN ('SETUP', 'ENTERED') AND NEW.exit_time IS NOT NULL THEN
        NEW.trade_status := 'CLOSED';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trade metrics calculation
CREATE TRIGGER trigger_calculate_trade_metrics
    BEFORE INSERT OR UPDATE ON ict_trades
    FOR EACH ROW
    EXECUTE FUNCTION calculate_trade_metrics();

-- 6.2 Function to validate confluence data
CREATE OR REPLACE FUNCTION validate_confluence_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate confluence score matches number of factors
    IF NEW.confluence_factors IS NOT NULL THEN
        IF jsonb_array_length(NEW.confluence_factors) < NEW.confluence_score THEN
            RAISE EXCEPTION 'Confluence score cannot exceed number of confluence factors';
        END IF;
    END IF;
    
    -- Validate applied concepts exist in definitions
    IF NEW.applied_concepts IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM ict_definitions 
            WHERE concept_name = ANY(
                SELECT jsonb_array_elements_text(NEW.applied_concepts)
            )
        ) THEN
            RAISE EXCEPTION 'Applied concepts must exist in ict_definitions table';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for confluence validation
CREATE TRIGGER trigger_validate_confluence
    BEFORE INSERT OR UPDATE ON ict_trades
    FOR EACH ROW
    EXECUTE FUNCTION validate_confluence_data();

-- =====================================================
-- 7. FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraints for referential integrity
ALTER TABLE ict_trades 
ADD CONSTRAINT fk_trades_trading_model 
FOREIGN KEY (trading_model_id) REFERENCES ict_trading_models(model_id);

ALTER TABLE ict_trades 
ADD CONSTRAINT fk_trades_entry_technique 
FOREIGN KEY (entry_technique_id) REFERENCES ict_entry_techniques(technique_id);

ALTER TABLE ict_trades 
ADD CONSTRAINT fk_trades_time_window 
FOREIGN KEY (time_window_id) REFERENCES ict_time_windows(window_id);

-- =====================================================
-- 8. CHECK CONSTRAINTS FOR DATA VALIDATION
-- =====================================================

-- Additional check constraints for trades table
ALTER TABLE ict_trades 
ADD CONSTRAINT chk_valid_direction 
CHECK (direction IN ('LONG', 'SHORT'));

ALTER TABLE ict_trades 
ADD CONSTRAINT chk_valid_bias 
CHECK (htf_bias IN ('BULLISH', 'BEARISH', 'NEUTRAL') AND ltf_bias IN ('BULLISH', 'BEARISH', 'NEUTRAL'));

ALTER TABLE ict_trades 
ADD CONSTRAINT chk_valid_status 
CHECK (trade_status IN ('SETUP', 'ENTERED', 'CLOSED', 'CANCELLED'));

ALTER TABLE ict_trades 
ADD CONSTRAINT chk_positive_account_balance 
CHECK (account_balance > 0);

ALTER TABLE ict_trades 
ADD CONSTRAINT chk_valid_risk_percent 
CHECK (risk_percent > 0 AND risk_percent <= 10);

ALTER TABLE ict_trades 
ADD CONSTRAINT chk_valid_confluence_score 
CHECK (confluence_score >= 0 AND confluence_score <= 10);

ALTER TABLE ict_trades 
ADD CONSTRAINT chk_valid_star_rating 
CHECK (star_rating >= 1 AND star_rating <= 5);

ALTER TABLE ict_trades 
ADD CONSTRAINT chk_logical_prices 
CHECK (
    (direction = 'LONG' AND entry_price > stop_loss AND take_profit_1 > entry_price) OR
    (direction = 'SHORT' AND entry_price < stop_loss AND take_profit_1 < entry_price) OR
    (entry_price IS NULL OR stop_loss IS NULL OR take_profit_1 IS NULL)
);

-- =====================================================
-- 9. MAINTENANCE AND OPTIMIZATION PROCEDURES
-- =====================================================

-- 9.1 Function to optimize all ICT tables
CREATE OR REPLACE FUNCTION optimize_ict_tables()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
BEGIN
    -- Analyze all tables for better query planning
    ANALYZE ict_definitions;
    ANALYZE ict_trading_models;
    ANALYZE ict_entry_techniques;
    ANALYZE ict_patterns;
    ANALYZE ict_time_windows;
    ANALYZE ict_trades;
    
    result_text := 'All ICT tables have been analyzed and optimized for better performance.';
    
    -- Update table statistics
    result_text := result_text || ' Statistics updated for query optimization.';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- 9.2 Function to cleanup test trades
CREATE OR REPLACE FUNCTION cleanup_test_trades(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ict_trades 
    WHERE trade_notes ILIKE '%test%' 
    AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. USAGE EXAMPLES AND COMMON QUERIES
-- =====================================================

-- Example 1: Find best performing trading models
/*
SELECT 
    model_name,
    trade_count,
    avg_return,
    win_rate,
    profit_factor
FROM ict_performance_by_model
WHERE trade_count >= 5
ORDER BY avg_return DESC
LIMIT 10;
*/

-- Example 2: Analyze confluence effectiveness
/*
SELECT 
    confluence_score,
    trade_count,
    avg_return,
    win_rate
FROM ict_confluence_analysis
ORDER BY confluence_score DESC;
*/

-- Example 3: Find optimal trading times
/*
SELECT 
    window_name,
    session,
    trade_count,
    avg_return,
    win_rate
FROM ict_performance_by_time
WHERE trade_count >= 3
ORDER BY avg_return DESC;
*/

-- Example 4: Get current Sharpe Ratio
/*
SELECT calculate_sharpe_ratio(0.02) as sharpe_ratio;
*/

-- Example 5: Get Maximum Drawdown
/*
SELECT calculate_max_drawdown() as max_drawdown_percent;
*/

-- Example 6: Active trades monitoring
/*
SELECT 
    t.trade_id,
    t.asset,
    t.direction,
    tm.model_name,
    et.technique_name,
    tw.window_name,
    t.confluence_score,
    t.star_rating,
    t.setup_time,
    t.trade_status
FROM ict_trades t
LEFT JOIN ict_trading_models tm ON t.trading_model_id = tm.model_id
LEFT JOIN ict_entry_techniques et ON t.entry_technique_id = et.technique_id
LEFT JOIN ict_time_windows tw ON t.time_window_id = tw.window_id
WHERE t.trade_status IN ('SETUP', 'ENTERED')
ORDER BY t.setup_time DESC;
*/

-- Example 7: Performance by asset analysis
/*
SELECT * FROM ict_performance_by_asset
WHERE trade_count >= 5
ORDER BY total_pnl DESC;
*/

-- =====================================================
-- 11. DATA VERIFICATION QUERIES
-- =====================================================

-- Verify data population
SELECT 'ICT Definitions' as table_name, COUNT(*) as record_count FROM ict_definitions
UNION ALL
SELECT 'Trading Models', COUNT(*) FROM ict_trading_models
UNION ALL
SELECT 'Entry Techniques', COUNT(*) FROM ict_entry_techniques
UNION ALL
SELECT 'Patterns', COUNT(*) FROM ict_patterns
UNION ALL
SELECT 'Time Windows', COUNT(*) FROM ict_time_windows
UNION ALL
SELECT 'Trades', COUNT(*) FROM ict_trades;

-- Verify foreign key relationships
SELECT 
    'Trades with valid models' as check_name,
    COUNT(*) as count
FROM ict_trades t
JOIN ict_trading_models tm ON t.trading_model_id = tm.model_id
UNION ALL
SELECT 
    'Trades with valid techniques',
    COUNT(*)
FROM ict_trades t
JOIN ict_entry_techniques et ON t.entry_technique_id = et.technique_id
UNION ALL
SELECT 
    'Trades with valid time windows',
    COUNT(*)
FROM ict_trades t
JOIN ict_time_windows tw ON t.time_window_id = tw.window_id;

-- =====================================================
-- 12. PERFORMANCE MONITORING
-- =====================================================

-- View to monitor database performance
CREATE VIEW ict_system_performance AS
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public' 
AND tablename LIKE 'ict_%'
ORDER BY tablename, attname;

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================

-- Success message
SELECT 
    'ICT Comprehensive Database Schema Deployment Complete!' as status,
    NOW() as deployment_time,
    'All tables, indexes, constraints, views, and functions have been created successfully.' as message;

-- Final optimization
SELECT optimize_ict_tables() as optimization_result;