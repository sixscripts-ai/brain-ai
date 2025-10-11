-- Sample Data for ICT Trading Database
-- This migration populates the database with comprehensive ICT trading knowledge

-- Insert ICT Definitions
INSERT INTO ict_definitions (concept, definition, key_characteristics, market_context, usage_notes, related_concepts) VALUES
('Fair Value Gap (FVG)', 'A three-candle formation where the middle candle creates a gap that is not filled by the wicks of the surrounding candles', 'Three consecutive candles, Middle candle body creates gap, Gap not filled by surrounding wicks', 'Forms during strong directional moves, Often acts as support/resistance', 'Look for price to return and react at FVG levels, Can be used for entries and targets', ARRAY['Liquidity Void', 'Imbalance', 'Order Block']),

('Order Block (OB)', 'The last bullish candle before a bearish move or the last bearish candle before a bullish move', 'Last opposing candle before trend change, High probability reaction zone, Often coincides with institutional activity', 'Forms at key market structure points, Represents institutional order flow', 'Use for entry triggers and stop loss placement, Combine with other confluences', ARRAY['Fair Value Gap', 'Breaker Block', 'Mitigation Block']),

('Breaker Block (BB)', 'A former Order Block that has been broken and now acts as the opposite polarity', 'Former resistance becomes support or vice versa, Polarity change after break, Strong reaction zone', 'Occurs after significant market structure breaks, Represents shift in institutional sentiment', 'Wait for clear break and retest, Use for high probability entries', ARRAY['Order Block', 'Change of Character', 'Market Structure Shift']),

('Liquidity Pool', 'Areas where stop losses and pending orders accumulate, typically above/below key levels', 'Concentration of orders, Above highs or below lows, Targeted by institutional players', 'Found at swing highs/lows, Round numbers, Previous support/resistance', 'Expect price to sweep these levels, Use for target areas and reversal zones', ARRAY['Stop Hunt', 'Liquidity Grab', 'Sweep']),

('Market Structure Shift (MSS)', 'A change in the overall trend direction confirmed by breaking previous structure', 'Break of previous high/low, Change in trend direction, Confirmation of new trend', 'Occurs at major turning points, Signals institutional repositioning', 'Wait for confirmation before trading, Use to identify trend changes', ARRAY['Change of Character', 'Break of Structure', 'Trend Change']),

('Change of Character (CHoCH)', 'An early indication of potential market structure shift', 'Break of recent structure, Early trend change signal, Precedes Market Structure Shift', 'First sign of trend weakness, May lead to full reversal', 'Use for early trend change identification, Combine with other confirmations', ARRAY['Market Structure Shift', 'Break of Structure', 'Trend Analysis']),

('Inducement', 'A move designed to attract retail traders into poor positions before the real move occurs', 'False breakout, Retail trap, Precedes opposite direction move', 'Common at key levels, Used to generate liquidity, Opposite to expected move', 'Avoid trading the obvious, Wait for the real move after inducement', ARRAY['Liquidity Grab', 'Stop Hunt', 'False Breakout']),

('Displacement', 'A strong, impulsive move that creates imbalances and fair value gaps', 'Strong directional move, Creates imbalances, High momentum candles', 'Indicates institutional activity, Often starts new trends, Creates trading opportunities', 'Look for retracements to imbalances, Use for trend continuation trades', ARRAY['Fair Value Gap', 'Imbalance', 'Impulse Move']),

('Mitigation', 'The process of price returning to fill imbalances or test key levels', 'Price returns to previous levels, Fills gaps or tests blocks, Provides trading opportunities', 'Natural market behavior, Creates entry opportunities, Validates key levels', 'Use for entries at mitigated levels, Combine with other confluences', ARRAY['Fair Value Gap', 'Order Block', 'Retracement']),

('Premium and Discount', 'Areas above and below the equilibrium price where assets are considered overvalued or undervalued', 'Premium: Upper 25% of range, Discount: Lower 25% of range, Equilibrium: Middle 50%', 'Based on recent price range, Helps identify value areas, Guides entry timing', 'Buy in discount, sell in premium, Avoid trading in equilibrium', ARRAY['Value Areas', 'Range Trading', 'Mean Reversion']),

('Liquidity Void', 'An area with little to no trading activity, often appearing as a gap on the chart', 'Minimal price action, Gap in trading activity, Price moves quickly through', 'Created during news events, Strong institutional moves, Low participation areas', 'Expect quick moves through voids, Use as targets or areas to avoid', ARRAY['Fair Value Gap', 'Imbalance', 'Gap']),

('Optimal Trade Entry (OTE)', 'The ideal entry point within a retracement, typically between 62%-79% Fibonacci levels', '62%-79% Fibonacci retracement, Confluence with other levels, High probability entry zone', 'Based on institutional retracement patterns, Combines with other ICT concepts', 'Wait for price to reach OTE levels, Combine with order blocks or FVGs', ARRAY['Fibonacci', 'Retracement', 'Entry Technique']),

('Turtle Soup', 'A pattern where price breaks a key level but quickly reverses, trapping breakout traders', 'False breakout, Quick reversal, Traps breakout traders', 'Common at support/resistance, Used to generate liquidity, Opposite to expected move', 'Fade the breakout, Look for quick reversal, Use tight stops', ARRAY['False Breakout', 'Reversal Pattern', 'Liquidity Grab']),

('Silver Bullet', 'A specific time-based trading setup that occurs during key market hours', 'Time-specific setup, High probability pattern, Occurs during active sessions', 'Based on institutional activity times, Higher success during key hours', 'Trade only during specified times, Combine with other ICT concepts', ARRAY['Time-based Trading', 'Session Trading', 'Institutional Hours']),

('Algorithmic Price Delivery', 'The systematic way institutions move price to achieve their objectives', 'Systematic price movement, Institutional objectives, Predictable patterns', 'Based on institutional needs, Creates tradeable patterns, Repeatable behavior', 'Study institutional behavior, Identify recurring patterns, Trade with the algorithm', ARRAY['Institutional Trading', 'Price Action', 'Market Mechanics']),

('Relative Equal Highs/Lows', 'Price levels that appear equal but have slight variations, often targeted for liquidity', 'Appear equal to retail, Slight price differences, Liquidity resting above/below', 'Common at swing points, Targeted by institutions, Create trading opportunities', 'Expect sweeps of these levels, Use for entries and targets', ARRAY['Liquidity Pool', 'Stop Hunt', 'Equal Levels']),

('Inefficiency', 'Areas where price has moved too quickly, leaving gaps or imbalances', 'Quick price movement, Gaps or imbalances, Unfilled areas', 'Created during strong moves, Represents missed opportunities, Often filled later', 'Expect price to return, Use for targets and entries', ARRAY['Fair Value Gap', 'Imbalance', 'Gap Fill']),

('Consolidation', 'A period of sideways price movement where the market is in balance', 'Sideways movement, Range-bound price, Balance between buyers and sellers', 'Occurs after strong moves, Accumulation or distribution, Precedes breakouts', 'Trade the range or wait for breakout, Identify key levels within range', ARRAY['Range Trading', 'Accumulation', 'Distribution']),

('Expansion', 'A period of strong directional movement following consolidation', 'Strong directional move, Follows consolidation, High momentum', 'Institutional positioning, Trend continuation or reversal, High probability moves', 'Trade in direction of expansion, Use pullbacks for entries', ARRAY['Trend Trading', 'Momentum', 'Breakout']),

('Rebalance', 'The process of price returning to fair value after an extreme move', 'Return to fair value, Correction after extreme, Natural market behavior', 'Follows overextended moves, Creates counter-trend opportunities, Temporary in nature', 'Use for counter-trend trades, Expect continuation after rebalance', ARRAY['Mean Reversion', 'Correction', 'Fair Value']),

('Swing Failure Pattern', 'A reversal pattern where price fails to make a new high/low despite attempting to do so', 'Failed new high/low, Reversal signal, Weakness in trend', 'Indicates trend exhaustion, Often occurs at key levels, Precedes reversals', 'Look for reversal opportunities, Use as trend change signal', ARRAY['Reversal Pattern', 'Trend Exhaustion', 'Failure Pattern']),

('Institutional Order Flow', 'The directional bias and positioning of large institutional players', 'Large player positioning, Directional bias, Market moving orders', 'Drives major price moves, Creates predictable patterns, Influences market structure', 'Align with institutional flow, Study order flow patterns, Trade with the big players', ARRAY['Smart Money', 'Market Structure', 'Directional Bias']);

-- Insert ICT Trading Models
INSERT INTO ict_trading_models (model_name, description, key_components, entry_criteria, exit_criteria, risk_management, success_rate, difficulty_level, market_conditions, timeframes) VALUES
('Power of Three', 'A comprehensive model based on accumulation, manipulation, and distribution phases', ARRAY['Accumulation Phase', 'Manipulation Phase', 'Distribution Phase', 'Time-based Analysis'], 'Enter during manipulation phase targeting distribution', 'Exit at distribution targets or reversal signals', 'Risk 1-2% per trade, use proper position sizing', 75.50, 'Advanced', 'Works in all market conditions, best during trending markets', ARRAY['1H', '4H', 'Daily']),

('Optimal Trade Entry Model', 'Focuses on entering trades at optimal retracement levels with high probability', ARRAY['Fibonacci Retracements', 'Order Blocks', 'Fair Value Gaps', 'Market Structure'], 'Enter at 62-79% retracement with confluence', 'Target previous highs/lows or next liquidity pool', 'Use 50-pip stops on EUR/USD, adjust for other pairs', 68.30, 'Intermediate', 'Best in trending markets with clear structure', ARRAY['15M', '1H', '4H']),

('Market Maker Model', 'Based on understanding how market makers operate and create liquidity', ARRAY['Liquidity Creation', 'Stop Hunts', 'Order Flow', 'Institutional Behavior'], 'Enter after liquidity grab and reversal confirmation', 'Exit at opposite liquidity pools or structure levels', 'Risk based on daily range, typically 1-2%', 72.80, 'Expert', 'Effective in all conditions, requires deep understanding', ARRAY['5M', '15M', '1H']),

('Silver Bullet Strategy', 'Time-based strategy focusing on specific high-probability time windows', ARRAY['Time Windows', 'Liquidity Concepts', 'Market Structure', 'Session Analysis'], 'Enter during silver bullet time with proper setup', 'Exit before session end or at predetermined targets', 'Tight risk management, 0.5-1% risk per trade', 65.20, 'Intermediate', 'Best during active trading sessions', ARRAY['1M', '5M', '15M']),

('Breaker Block Strategy', 'Focuses on trading former support/resistance levels after they break', ARRAY['Order Blocks', 'Breaker Blocks', 'Market Structure', 'Polarity Changes'], 'Enter on retest of breaker block with confirmation', 'Target next structure level or liquidity pool', 'Use structure-based stops, risk 1-2%', 70.40, 'Intermediate', 'Works well in trending and ranging markets', ARRAY['15M', '1H', '4H']),

('Fair Value Gap Strategy', 'Specializes in trading imbalances and fair value gaps', ARRAY['Fair Value Gaps', 'Imbalances', 'Price Action', 'Gap Analysis'], 'Enter on approach to unfilled FVG with confluence', 'Exit at gap fill or next significant level', 'Risk based on gap size, typically 1-2%', 63.70, 'Beginner', 'Effective in volatile markets with clear gaps', ARRAY['5M', '15M', '1H']),

('Liquidity Grab Model', 'Focuses on identifying and trading liquidity sweeps', ARRAY['Liquidity Pools', 'Stop Hunts', 'Sweep Patterns', 'Reversal Signals'], 'Enter after liquidity sweep with reversal confirmation', 'Target opposite liquidity or structure levels', 'Use sweep-based stops, risk 1-2%', 69.10, 'Advanced', 'Most effective during high-impact news and key levels', ARRAY['1M', '5M', '15M']),

('Turtle Soup Plus One', 'Enhanced version of turtle soup focusing on false breakouts', ARRAY['False Breakouts', 'Reversal Patterns', 'Liquidity Analysis', 'Timing'], 'Enter on false breakout reversal with confirmation', 'Target previous structure or measured moves', 'Tight stops above/below breakout level', 58.90, 'Intermediate', 'Works best at key support/resistance levels', ARRAY['15M', '1H', '4H']),

('Institutional Order Flow Model', 'Advanced model based on reading institutional positioning', ARRAY['Order Flow Analysis', 'Smart Money Concepts', 'Market Structure', 'Volume Analysis'], 'Enter when aligned with institutional flow', 'Exit when flow changes or targets reached', 'Dynamic risk based on market conditions', 78.20, 'Expert', 'Requires deep market understanding, works in all conditions', ARRAY['1H', '4H', 'Daily']),

('Mean Reversion Model', 'Focuses on trading back to fair value from extreme levels', ARRAY['Premium/Discount', 'Fair Value', 'Reversion Patterns', 'Equilibrium'], 'Enter at extreme premium/discount levels', 'Exit at equilibrium or fair value', 'Risk based on range size, 1-2%', 61.50, 'Beginner', 'Best in ranging markets and after extreme moves', ARRAY['1H', '4H', 'Daily']);

-- Insert ICT Entry Techniques
INSERT INTO ict_entry_techniques (technique_name, description, setup_requirements, entry_trigger, stop_loss_placement, take_profit_strategy, risk_reward_ratio, difficulty_level, best_timeframes, market_sessions) VALUES
('Order Block Entry', 'Entering trades at the last opposing candle before a move', 'Clear market structure, Identified order block, Price approaching block', 'Price reaction at order block level with confirmation', 'Below/above the order block structure', 'Target next liquidity pool or structure level', 2.50, 'Intermediate', ARRAY['15M', '1H', '4H'], ARRAY['London'::market_session_type, 'New York'::market_session_type]),

('Fair Value Gap Entry', 'Trading the return to unfilled imbalances', 'Identified fair value gap, Price moving toward gap, Clear directional bias', 'Price enters the fair value gap area', 'Beyond the fair value gap', 'Gap fill or next significant level', 2.00, 'Beginner', ARRAY['5M', '15M', '1H'], ARRAY['London'::market_session_type, 'New York'::market_session_type, 'Asian'::market_session_type]),

('Breaker Block Entry', 'Entering at former support/resistance after break', 'Broken order block, Clear polarity change, Price returning to level', 'Reaction at breaker block with confirmation', 'Beyond the breaker block structure', 'Next structure level or liquidity', 3.00, 'Intermediate', ARRAY['15M', '1H', '4H'], ARRAY['London'::market_session_type, 'New York'::market_session_type]),

('Optimal Trade Entry', 'Entering at 62-79% Fibonacci retracement levels', 'Clear trend, Fibonacci retracement, Confluence with other levels', 'Price reaches 62-79% retracement with reaction', 'Below/above the retracement level', 'Previous high/low or extension levels', 2.80, 'Intermediate', ARRAY['15M', '1H', '4H'], ARRAY['London'::market_session_type, 'New York'::market_session_type]),

('Liquidity Grab Entry', 'Entering after stop hunts and liquidity sweeps', 'Identified liquidity pool, Price approaching level, Reversal setup', 'Liquidity sweep followed by reversal', 'Beyond the swept level', 'Opposite liquidity or structure', 3.50, 'Advanced', ARRAY['1M', '5M', '15M'], ARRAY['London'::market_session_type, 'New York'::market_session_type]),

('Market Structure Break Entry', 'Entering on confirmed structure breaks', 'Clear market structure, Break setup, Momentum confirmation', 'Clean break of structure with follow-through', 'Previous structure level', 'Next major structure or target', 2.20, 'Intermediate', ARRAY['15M', '1H', '4H'], ARRAY['London'::market_session_type, 'New York'::market_session_type]),

('Mitigation Entry', 'Entering when price returns to mitigate previous levels', 'Previous imbalance or level, Price returning, Mitigation setup', 'Price reaches mitigation level with reaction', 'Beyond the mitigated level', 'Next target or structure level', 2.60, 'Intermediate', ARRAY['5M', '15M', '1H'], ARRAY['London'::market_session_type, 'New York'::market_session_type, 'Asian'::market_session_type]),

('Turtle Soup Entry', 'Entering on false breakout reversals', 'Key support/resistance level, False breakout setup, Reversal signals', 'False breakout followed by quick reversal', 'Beyond the false breakout level', 'Previous structure or measured move', 2.40, 'Intermediate', ARRAY['15M', '1H', '4H'], ARRAY['London'::market_session_type, 'New York'::market_session_type]),

('Silver Bullet Entry', 'Time-specific entries during high-probability windows', 'Specific time window, Setup criteria met, Market conditions favorable', 'Entry signal during silver bullet time', 'Time-based or structure-based stop', 'Session targets or structure levels', 3.20, 'Advanced', ARRAY['1M', '5M', '15M'], ARRAY['London'::market_session_type, 'New York'::market_session_type]),

('Displacement Entry', 'Entering on strong impulsive moves with retracements', 'Strong displacement move, Clear direction, Retracement setup', 'Retracement to key level with continuation', 'Previous structure or displacement low/high', 'Extension targets or next structure', 2.70, 'Advanced', ARRAY['5M', '15M', '1H'], ARRAY['London'::market_session_type, 'New York'::market_session_type]);

-- Insert ICT Patterns
INSERT INTO ict_patterns (pattern_name, pattern_type, description, identification_rules, trading_strategy, reliability_score, best_timeframes, market_context, examples) VALUES
('Fair Value Gap Pattern', 'Continuation', 'Three-candle pattern creating an unfilled gap', 'Three consecutive candles, Middle candle creates gap, Gap not filled by surrounding wicks', 'Trade the return to gap for continuation or reversal', 0.75, ARRAY['5M', '15M', '1H'], 'Strong trending moves, News events', 'EUR/USD during London open, GBP/USD news reactions'),

('Order Block Pattern', 'Reversal', 'Last opposing candle before significant move', 'Last bullish candle before bearish move or vice versa, Clear reaction level, Institutional activity signs', 'Enter on return to order block level', 0.82, ARRAY['15M', '1H', '4H'], 'Market structure points, Trend changes', 'Daily order blocks on major pairs, 4H blocks during reversals'),

('Breaker Block Pattern', 'Reversal', 'Former order block that changes polarity', 'Previous order block broken, Polarity change confirmed, Price returning to level', 'Trade the retest of breaker block', 0.78, ARRAY['15M', '1H', '4H'], 'After significant breaks, Trend continuations', 'Support becomes resistance, Resistance becomes support'),

('Liquidity Sweep Pattern', 'Reversal', 'Stop hunt followed by reversal', 'Price sweeps obvious levels, Quick reversal follows, Volume/momentum divergence', 'Fade the sweep, trade the reversal', 0.73, ARRAY['1M', '5M', '15M'], 'Key levels, High-impact news', 'Sweep of daily highs/lows, Round number sweeps'),

('Market Structure Shift', 'Reversal', 'Change in overall market direction', 'Break of previous structure, New trend direction, Confirmation candles', 'Trade in direction of new structure', 0.85, ARRAY['1H', '4H', 'Daily'], 'Major trend changes, Institutional repositioning', 'Weekly trend changes, Major pair reversals'),

('Displacement Pattern', 'Continuation', 'Strong impulsive move creating imbalances', 'High momentum candles, Gaps or imbalances created, Clear direction', 'Trade retracements for continuation', 0.71, ARRAY['5M', '15M', '1H'], 'News events, Institutional activity', 'NFP reactions, Central bank announcements'),

('Consolidation Break', 'Breakout', 'Range breakout with follow-through', 'Clear range boundaries, Clean breakout, Volume confirmation', 'Trade the breakout direction', 0.68, ARRAY['15M', '1H', '4H'], 'After consolidation periods, Before major news', 'Daily range breaks, Weekly consolidation exits'),

('Turtle Soup Pattern', 'Reversal', 'False breakout followed by reversal', 'Break of key level, Quick failure, Reversal confirmation', 'Fade the breakout, trade reversal', 0.65, ARRAY['15M', '1H', '4H'], 'Key support/resistance, Obvious levels', 'False daily breakouts, Fake weekly breaks'),

('Swing Failure Pattern', 'Reversal', 'Failed attempt to make new high/low', 'Attempt at new high/low, Failure to break, Reversal signals', 'Trade the failure reversal', 0.70, ARRAY['1H', '4H', 'Daily'], 'Trend exhaustion, Key levels', 'Double top failures, Higher high failures'),

('Optimal Trade Entry Pattern', 'Continuation', 'Retracement to 62-79% Fibonacci levels', '62-79% retracement, Confluence with other levels, Reaction signals', 'Enter at OTE level for continuation', 0.76, ARRAY['15M', '1H', '4H'], 'Trending markets, Clear structure', 'Major pair retracements, Trend continuation setups');

-- Insert ICT Time Windows
INSERT INTO ict_time_windows (window_name, start_time, end_time, market_session, description, significance, trading_opportunities, volatility_level) VALUES
('London Open', '08:00:00', '10:00:00', 'London', 'Initial two hours of London session', 'High institutional activity, major moves often begin', 'Breakouts, trend continuations, reversals', 'High'),
('New York Open', '13:30:00', '15:30:00', 'New York', 'First two hours of New York session', 'Highest volume period, major news impact', 'All trading strategies, high probability setups', 'Very High'),
('London Close', '16:00:00', '17:00:00', 'London', 'Final hour of London session', 'Position adjustments, profit taking', 'Reversal patterns, consolidation breaks', 'Medium'),
('Asian Range', '21:00:00', '06:00:00', 'Asian', 'Overnight Asian trading session', 'Lower volatility, range-bound trading', 'Range trading, mean reversion', 'Low'),
('Silver Bullet AM', '10:00:00', '11:00:00', 'London', 'Mid-morning London session', 'Institutional positioning, high probability', 'Precision entries, continuation trades', 'Medium'),
('Silver Bullet PM', '14:00:00', '15:00:00', 'New York', 'Early New York session', 'Pre-news positioning, setup completion', 'High probability entries, trend trades', 'High'),
('Lunch Hour', '12:00:00', '13:00:00', 'London', 'London lunch period', 'Reduced activity, consolidation common', 'Range trading, avoid major positions', 'Low'),
('Overlap Period', '13:00:00', '16:00:00', 'New York', 'London-New York overlap', 'Highest liquidity and volatility', 'All strategies, major opportunities', 'Very High'),
('Sydney Open', '22:00:00', '00:00:00', 'Sydney', 'Start of Sydney session', 'Week opening, gap analysis', 'Gap trading, weekly bias establishment', 'Medium'),
('Power Hour', '15:00:00', '16:00:00', 'New York', 'Final hour before London close', 'Position squaring, momentum moves', 'Momentum trades, breakout continuations', 'High');

-- Create some sample trades (these would typically be user-specific)
-- Note: In a real application, these would be inserted by authenticated users
-- For demonstration, we'll create a few sample trades without user_id (will need to be updated with actual user IDs)

-- The sample trades will be inserted after user registration in the application
-- This is just the schema setup