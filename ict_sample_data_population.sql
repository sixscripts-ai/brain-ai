-- ICT Database Sample Data Population Script
-- Based on ict_core.csv and ict_schema_query_base.json
-- This script populates all tables with exact data from the reference files

-- =====================================================
-- 1. ICT CORE DEFINITIONS (from ict_core.csv)
-- =====================================================

INSERT INTO ict_definitions (
    concept_name, definition_text, key_characteristics, typical_confirmation, 
    trading_rule, common_mistake, related_concepts, ict_entry_technique, 
    ict_price_action_model, chart_example, concept_category, concept_type, complexity_level
) VALUES 

-- Order Block
('Order Block', 
'A price level where institutional orders were placed, creating significant buying or selling pressure that caused a strong directional move away from that level.',
'Strong directional move away from the level, High volume at formation, Clean price rejection, Imbalance creation',
'Price returns to the level and shows rejection, Volume spike on approach, Wick formation at the level',
'Wait for price to return to OB level, Look for rejection signals, Enter on lower timeframe confirmation',
'Entering too early without confirmation, Trading against the trend, Ignoring volume confirmation',
'Fair Value Gap, Breaker Block, Mitigation Block, Liquidity Pool',
'OB Pullback Entry, Breaker Block Reversal Entry',
'Buy Model A – OB Pullback + FVG Fill, Sell Model A – OB Short Pullback',
'Strong bearish candle creating imbalance, followed by pullback to the origin',
'Core ICT', 'OB', 4),

-- Fair Value Gap
('Fair Value Gap', 
'An imbalance in price where there is a gap between the high of one candle and the low of another candle, with a candle in between that does not overlap.',
'Three-candle formation, No overlap between 1st and 3rd candle, Strong directional move, Imbalance in buying/selling',
'Price returns to fill the gap, Volume increase when approaching gap, Rejection or continuation at gap level',
'Identify the gap formation, Wait for price to return, Look for reaction at gap boundaries',
'Trading every gap without context, Ignoring market structure, Not waiting for confirmation',
'Order Block, Liquidity Pool, Displacement, Market Structure',
'FVG Fill Entry, Displacement Breakout Entry',
'Buy Model A – OB Pullback + FVG Fill, Sell Model B – Liquidity Sweep Short after FVG',
'Gap between candle highs and lows showing imbalance',
'Core ICT', 'FVG', 3),

-- Liquidity Pool
('Liquidity Pool', 
'Areas where stop losses and pending orders accumulate, typically at swing highs, swing lows, or round numbers.',
'Obvious swing points, Round number levels, Multiple touches, Stop loss accumulation',
'Price sweeps through the level quickly, Volume spike during sweep, Immediate reversal after sweep',
'Identify obvious levels, Wait for liquidity sweep, Enter on reversal confirmation',
'Chasing the sweep, Not waiting for reversal, Ignoring market structure context',
'Order Block, Fair Value Gap, Market Structure, Displacement',
'Liquidity Sweep Pullback Entry, BOS Pullback Entry',
'Liquidity Sweep Pattern, Smart Money Consolidation',
'Multiple touches at swing high/low followed by quick sweep and reversal',
'Core ICT', 'Liquidity', 4),

-- Premium/Discount Array
('Premium/Discount Array', 
'A method of determining whether current price is at a premium (expensive) or discount (cheap) relative to a defined range, typically using Fibonacci levels.',
'50% equilibrium level, Premium above 50%, Discount below 50%, Range-based analysis',
'Price reaction at key Fibonacci levels, Confluence with other ICT concepts, Market structure alignment',
'Identify the range, Calculate Fibonacci levels, Look for reactions at key levels (62%, 79%, etc.)',
'Using wrong range for calculation, Ignoring market structure, Trading against the bias',
'Market Structure, Order Block, Fair Value Gap, Fibonacci',
'MTA (Multiple-TF Alignment) Entry, Pullback to Order Block Entry',
'All Buy/Sell Models incorporate PD Array analysis',
'Fibonacci retracement showing premium/discount levels within a defined range',
'Core ICT', 'PD Array', 3),

-- Market Structure
('Market Structure', 
'The overall framework of price movement showing the relationship between swing highs and swing lows to determine market direction and trend.',
'Higher highs and higher lows (bullish), Lower highs and lower lows (bearish), Break of structure, Change of character',
'Break of previous swing high/low, Shift in market structure, Change of character confirmation',
'Identify current structure, Look for breaks or shifts, Align trades with structure',
'Trading against structure, Misidentifying swing points, Ignoring timeframe context',
'Break of Structure, Change of Character, Displacement, Trend Analysis',
'BOS Pullback Entry, Market Structure confirmation in all entries',
'ICT Market Structure (BOS/CHoCH), All trading models',
'Series of swing highs and lows showing trend direction and potential changes',
'Core ICT', 'Structure', 5),

-- Kill Zone
('Kill Zone', 
'Specific time periods during trading sessions when institutional activity is highest and significant price moves are most likely to occur.',
'London Kill Zone (02:00-05:00 EST), New York Kill Zone (07:00-10:00 EST), High probability periods, Institutional activity',
'Increased volatility during these times, Significant price moves, Volume increase',
'Trade only during kill zones, Combine with other ICT concepts, Focus on high-probability setups',
'Trading outside kill zones, Ignoring session characteristics, Not considering time-based edge',
'Silver Bullet, Macro Times, Session Analysis, Time-based Trading',
'Silver Bullet 20-min Entry, All time-based entries',
'All models incorporate kill zone timing',
'Time-based chart showing increased volatility and moves during specific periods',
'Core ICT', 'Time', 3),

-- Silver Bullet
('Silver Bullet', 
'A specific 20-minute window within kill zones where the highest probability setups occur, typically showing a clear directional bias.',
'20-minute window, Clear directional bias, High probability, Within kill zone timing',
'Strong directional move within the window, Volume confirmation, Follow-through after the window',
'Identify the 20-minute window, Determine bias direction, Enter on confirmation within window',
'Trading outside the window, Misidentifying the bias, Not waiting for confirmation',
'Kill Zone, Macro Times, Time-based Analysis, Session Trading',
'Silver Bullet 20-min Entry',
'Incorporated in all time-sensitive models',
'20-minute period showing clear directional bias and strong moves',
'Core ICT', 'Time', 4),

-- AMD Model
('AMD Model', 
'Accumulation, Manipulation, Distribution - a three-phase model describing how institutional money moves markets through these distinct phases.',
'Three distinct phases, Accumulation (sideways), Manipulation (false moves), Distribution (trending)',
'Completion of all three phases, Volume characteristics in each phase, Time-based progression',
'Identify current phase, Wait for phase completion, Enter during distribution phase',
'Entering during wrong phase, Misidentifying phase transitions, Ignoring volume analysis',
'PO3 Model, Market Structure, Institutional Trading, Phase Analysis',
'Phase-based entries, Distribution phase entries',
'AMD Model specific trading approach',
'Chart showing three distinct phases of institutional accumulation, manipulation, and distribution',
'Core ICT', 'Model', 5),

-- PO3 Model
('PO3 Model', 
'Power of Three - a model describing market movement in three phases: Accumulation, Manipulation, and Distribution, similar to AMD but with specific timing focus.',
'Three phases within session, Accumulation phase, Manipulation phase, Distribution phase',
'Clear phase identification, Volume confirmation, Time-based progression within session',
'Identify session phases, Wait for manipulation completion, Enter during distribution',
'Trading during accumulation, Misreading manipulation, Early distribution entries',
'AMD Model, Session Analysis, Institutional Trading, Time-based Models',
'Session-based entries, Phase transition entries',
'PO3 Model trading framework',
'Intraday chart showing three phases within a trading session',
'Core ICT', 'Model', 5),

-- Judas Swing
('Judas Swing', 
'A false move that occurs typically in the first hour of a session, designed to trap retail traders before the real move begins in the opposite direction.',
'False breakout, Early session timing, Retail trap, Reversal setup',
'False breakout failure, Volume characteristics, Time-based reversal',
'Identify false breakout, Wait for failure confirmation, Enter on reversal',
'Chasing the false move, Not waiting for confirmation, Ignoring time context',
'False Breakout, Session Analysis, Retail Traps, Reversal Trading',
'Judas Swing reversal entries',
'Judas Swing specific model',
'Early session false breakout followed by strong reversal move',
'Core ICT', 'Model', 4);

-- =====================================================
-- 2. ICT TRADING MODELS (from ict_schema_query_base.json)
-- =====================================================

INSERT INTO ict_trading_models (
    model_name, model_category, model_type, definition, description, key_characteristics,
    setup_conditions, entry_criteria, confirmation_rules, exit_strategy,
    success_rate, risk_reward_ratio, win_rate, related_concepts, common_mistakes, chart_examples
) VALUES

-- Bar Patterns
('2-Bar Reversal', 'Bar Pattern', '2-Bar Reversal',
'A two-candle reversal pattern where the second candle completely engulfs the first candle in the opposite direction.',
'Simple but effective reversal pattern used to identify potential turning points in price action.',
'Two consecutive candles, Second candle engulfs first, Opposite direction movement, Volume confirmation preferred',
'Identify trending market, Look for exhaustion signs, Wait for two-candle formation',
'Second candle must engulf first completely, Volume increase on second candle, Confirmation on next candle',
'Third candle must continue in reversal direction, Break of previous structure, Volume follow-through',
'Target previous swing level, Use first candle low/high as stop, Scale out at resistance/support',
75.5, 2.1, 68.2, 'Market Structure, Reversal Trading, Volume Analysis', 
'Entering too early, Ignoring volume, Trading against major trend',
'Two-candle formation showing complete engulfment and reversal'),

('3-Bar Reversal', 'Bar Pattern', '3-Bar Reversal',
'A three-candle reversal pattern providing higher probability than 2-bar reversal with additional confirmation.',
'More reliable reversal pattern with built-in confirmation through the third candle.',
'Three consecutive candles, Progressive reversal formation, Volume increase, Structure break',
'Strong trending move, Exhaustion signals present, Three-candle formation completion',
'Third candle confirms reversal direction, Volume expansion, Previous structure broken',
'Fourth candle continuation, Support/resistance hold, Follow-through momentum',
'Multiple targets based on structure, Trailing stop strategy, Partial profit taking',
82.3, 2.4, 74.1, 'Market Structure, Confirmation Trading, Momentum Analysis',
'Premature entry, Weak volume confirmation, Counter-trend trading',
'Three-candle progressive reversal with volume confirmation'),

('4-Bar Continuation', 'Bar Pattern', '4-Bar Continuation',
'A four-candle pattern that confirms trend continuation after a brief consolidation or pullback.',
'Trend continuation pattern used to enter in direction of established trend.',
'Four candle sequence, Brief consolidation, Trend resumption, Volume characteristics',
'Established trend present, Pullback or consolidation, Four-bar completion',
'Fourth candle breaks consolidation, Volume increase, Trend direction confirmed',
'Fifth candle follow-through, New highs/lows achieved, Momentum continuation',
'Trend targets, Previous swing levels, Trailing stop management',
78.9, 1.8, 71.5, 'Trend Trading, Continuation Patterns, Momentum',
'Fighting the trend, Poor timing, Inadequate risk management',
'Four-candle sequence showing consolidation and trend resumption');

-- =====================================================
-- 3. ICT ENTRY TECHNIQUES (from ict_schema_query_base.json)
-- =====================================================

INSERT INTO ict_entry_techniques (
    technique_name, technique_category, definition, description, key_characteristics,
    setup_requirements, entry_conditions, confirmation_steps, timing_rules,
    stop_loss_placement, take_profit_targets, position_sizing,
    success_rate, avg_risk_reward, optimal_timeframes, related_models, related_concepts, common_mistakes, chart_examples
) VALUES

('BOS Pullback Entry', 'Pullback Entry',
'Entry technique that waits for a Break of Structure (BOS) followed by a pullback to a key level before entering in the direction of the break.',
'High-probability entry method that combines market structure analysis with precise timing.',
'Break of structure confirmation, Pullback to key level, Lower timeframe confirmation, Risk-reward optimization',
'Clear market structure, Recent BOS, Pullback in progress, Key level identified',
'Price pulls back to OB/FVG, Lower timeframe reversal signal, Volume confirmation',
'LTF structure break, Rejection at key level, Momentum resumption',
'Enter during pullback phase, Avoid news events, Use kill zone timing',
'Below/above pullback level, Recent swing low/high, Structure-based stop',
'Previous high/low, Extension levels, Structure targets',
'1-2% risk per trade, Position based on stop distance, Conservative sizing',
73.2, 2.3, '15M, 5M, 1M', 'Market Structure Models, BOS Patterns',
'Market Structure, Order Block, Fair Value Gap, Break of Structure',
'Entering too early, Ignoring LTF confirmation, Poor stop placement',
'BOS followed by pullback to order block with LTF confirmation'),

('Liquidity Sweep Pullback Entry', 'Pullback Entry',
'Entry technique that capitalizes on liquidity sweeps followed by pullbacks to key institutional levels.',
'Advanced entry method focusing on institutional liquidity manipulation.',
'Liquidity sweep identification, Pullback to institutional level, Smart money confirmation, High reward potential',
'Obvious liquidity level, Recent sweep completion, Pullback development, Institutional interest',
'Sweep completed, Price pulls back, Key level approach, Volume analysis',
'Rejection at key level, LTF reversal pattern, Smart money confirmation',
'Post-sweep timing, Avoid immediate chase, Wait for pullback completion',
'Beyond sweep level, Recent structure, Liquidity-based stop',
'Opposite liquidity, Major structure, Extension targets',
'1-3% risk per trade, Aggressive sizing allowed, High reward focus',
69.8, 3.1, '5M, 1M, 15M', 'Liquidity Models, Sweep Patterns',
'Liquidity Pool, Market Structure, Smart Money, Institutional Trading',
'Chasing sweeps, Poor timing, Inadequate confirmation',
'Liquidity sweep at swing high followed by pullback to order block');

-- =====================================================
-- 4. ICT PATTERNS
-- =====================================================

INSERT INTO ict_patterns (
    pattern_name, pattern_category, definition, description, key_characteristics,
    identification_rules, confirmation_criteria, invalidation_rules,
    optimal_timeframes, market_conditions, success_probability,
    related_models, related_techniques, related_concepts, chart_examples, common_mistakes
) VALUES

('Smart Money Consolidation', 'Accumulation',
'A consolidation pattern where smart money accumulates positions while retail traders are trapped in a range.',
'Institutional accumulation pattern disguised as sideways price action.',
'Range-bound price action, Multiple false breakouts, Volume characteristics, Time-based development',
'Identify consolidation range, Multiple touches of boundaries, False breakout attempts',
'Volume increase on real breakout, Structure break confirmation, Follow-through momentum',
'Return to range after breakout, Lack of volume, No follow-through',
'1H, 4H, Daily', 'Low volatility, Pre-news, Session transitions',
81.4, 'Smart Money Models, Consolidation Patterns', 'Range Trading Entries, Breakout Entries',
'Market Structure, Liquidity Pool, Institutional Trading',
'Consolidation range with multiple false breaks followed by explosive move',
'Trading false breakouts, Premature entries, Ignoring volume');

-- =====================================================
-- 5. ICT TIME WINDOWS
-- =====================================================

INSERT INTO ict_time_windows (
    window_name, window_type, session, start_time, end_time, timezone,
    description, probability_rating, optimal_pairs, market_conditions,
    success_rate, avg_move_points, frequency, notes, chart_examples
) VALUES

('London Kill Zone', 'Kill Zone', 'London', '02:00:00', '05:00:00', 'EST',
'Primary London session kill zone with highest institutional activity.',
5, 'GBPUSD, EURUSD, GBPJPY', 'High volatility, Trending',
78.5, 45.2, 'Daily', 'Most reliable kill zone for European pairs',
'Increased volatility and directional moves during London open'),

('New York Kill Zone', 'Kill Zone', 'New York', '07:00:00', '10:00:00', 'EST',
'Primary New York session kill zone coinciding with major economic releases.',
5, 'EURUSD, GBPUSD, USDCAD', 'High volatility, News-driven',
82.1, 52.8, 'Daily', 'Highest probability window for USD pairs',
'Strong directional moves during NY session open'),

('Silver Bullet London', 'Silver Bullet', 'London', '03:00:00', '03:20:00', 'EST',
'20-minute high-probability window within London kill zone.',
4, 'GBPUSD, EURUSD', 'Directional bias, Clean moves',
71.3, 28.7, 'Daily', 'Focus on GBP pairs during this window',
'20-minute window showing clear directional bias'),

('Silver Bullet New York', 'Silver Bullet', 'New York', '09:30:00', '09:50:00', 'EST',
'20-minute high-probability window within New York kill zone.',
4, 'EURUSD, USDCAD', 'Strong momentum, Follow-through',
74.9, 31.4, 'Daily', 'Coincides with US market open',
'20-minute window with strong momentum moves');

-- =====================================================
-- 6. SAMPLE TRADE DATA
-- =====================================================

INSERT INTO ict_trades (
    asset, trade_direction, trade_status, bias_htf, bias_ltf, timeframe_htf, timeframe_ltf,
    trading_model_id, entry_technique_id, pattern_id, time_window_id,
    order_block_type, fvg_type, liquidity_type, pd_array_level, pd_array_percentage,
    market_structure, displacement_present, displacement_type, liquidity_sweep, smt_divergence,
    entry_price, stop_loss, take_profit_1, take_profit_2, take_profit_3,
    risk_percent, position_size, risk_reward_ratio, confluence_score, confluence_factors, star_rating,
    setup_time, entry_time, exit_time, pnl_points, pnl_percent, pnl_dollar,
    max_favorable_excursion, max_adverse_excursion, execution_quality, setup_quality, timing_quality,
    pre_trade_analysis, post_trade_review, lessons_learned
) VALUES

('EURUSD', 'LONG', 'CLOSED', 'BULLISH', 'BULLISH', '4H', '15M',
1, 1, 1, 1, 'Bullish OB', 'Bullish FVG', 'SSL', 'Discount', 23.6,
'BOS', TRUE, 'Strong', 'SSL Sweep', 'None',
1.08450, 1.08200, 1.08750, 1.09100, 1.09500,
2.0, 20000, 2.4, 8, '["Order Block", "FVG", "BOS", "Kill Zone", "Discount Array", "Volume", "Structure", "Liquidity Sweep"]', 4,
'2024-01-15 08:30:00', '2024-01-15 09:15:00', '2024-01-15 14:20:00',
300, 2.76, 552.00, 380, -45, 4, 5, 4,
'Strong bullish structure on 4H, pullback to discount OB with FVG confluence during NY kill zone',
'Excellent execution, hit TP2. Could have held longer for TP3. Good confluence analysis.',
'Trust the process, confluence matters. Time-based entries work well.'),

('GBPUSD', 'SHORT', 'CLOSED', 'BEARISH', 'BEARISH', 'Daily', '5M',
2, 2, NULL, 2, 'Bearish OB', NULL, 'BSL', 'Premium', 78.6,
'CHoCH', TRUE, 'Strong', 'BSL Sweep', 'Type 1',
1.26850, 1.27200, 1.26500, 1.26100, 1.25700,
1.5, 15000, 3.2, 9, '["Order Block", "Premium Array", "CHoCH", "Kill Zone", "SMT Divergence", "Liquidity Sweep", "Volume", "Structure", "Displacement"]', 5,
'2024-01-16 02:45:00', '2024-01-16 03:10:00', '2024-01-16 11:30:00',
485, 3.82, 573.00, 520, -78, 5, 5, 5,
'Perfect bearish setup with CHoCH, premium OB, and SMT divergence during London kill zone',
'Flawless trade execution. All confluence factors aligned. Hit TP2 as planned.',
'High confluence setups have higher success rate. SMT divergence adds significant edge.');

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check data population
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