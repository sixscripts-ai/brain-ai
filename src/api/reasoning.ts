import express from 'express';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { AuthService } from '../services/auth';
import { VectorStore } from '../embeddings/vector-store';
import { ICTReasoningEngine, ReasoningContext, TradingDecision, MarketAnalysis } from '../reasoning/ict-reasoning-engine';
import { APIResponse } from '../types';

const router = express.Router();

// Initialize services
let dbService: SupabaseDatabaseService;
let authService: AuthService;
let vectorStore: VectorStore;
let reasoningEngine: ICTReasoningEngine;

// Middleware to initialize services
router.use(async (req, res, next) => {
  try {
    if (!dbService) {
      dbService = new SupabaseDatabaseService();
      await dbService.initialize();
    }
    
    if (!authService) {
      authService = new AuthService();
    }
    
    if (!vectorStore) {
      vectorStore = new VectorStore(dbService);
      await vectorStore.initialize();
    }
    
    if (!reasoningEngine) {
      reasoningEngine = new ICTReasoningEngine(dbService, vectorStore);
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to initialize reasoning services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/analyze-market
 * Analyze market conditions using ICT concepts
 */
router.post('/analyze-market', async (req, res) => {
  try {
    const { symbol, timeframe, currentPrice, marketData, userPreferences } = req.body;
    
    if (!symbol || !timeframe || !currentPrice) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'symbol, timeframe, and currentPrice are required'
      });
    }
    
    const context: ReasoningContext = {
      symbol,
      timeframe,
      currentPrice,
      marketData,
      userPreferences
    };
    
    const analysis = await reasoningEngine.analyzeMarket(context);
    
    res.json({
      success: true,
      data: {
        analysis,
        context,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error analyzing market:', error);
    res.status(500).json({
      error: 'Market analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/trading-decision
 * Generate trading decision based on ICT analysis
 */
router.post('/trading-decision', async (req, res) => {
  try {
    const { symbol, timeframe, currentPrice, marketData, userPreferences, analysis } = req.body;
    
    if (!symbol || !timeframe || !currentPrice) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'symbol, timeframe, and currentPrice are required'
      });
    }
    
    const context: ReasoningContext = {
      symbol,
      timeframe,
      currentPrice,
      marketData,
      userPreferences
    };
    
    const decision = await reasoningEngine.generateTradingDecision(context, analysis);
    
    res.json({
      success: true,
      data: {
        decision,
        context,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating trading decision:', error);
    res.status(500).json({
      error: 'Trading decision generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/validate-decision
 * Validate trading decision against ICT principles
 */
router.post('/validate-decision', async (req, res) => {
  try {
    const { decision, context, analysis } = req.body;
    
    if (!decision || !context || !analysis) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'decision, context, and analysis are required'
      });
    }
    
    const validation = await reasoningEngine.validateDecision(decision, context, analysis);
    
    res.json({
      success: true,
      data: {
        validation,
        validatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating decision:', error);
    res.status(500).json({
      error: 'Decision validation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/explain
 * Get detailed explanation of trading decision reasoning
 */
router.post('/explain', async (req, res) => {
  try {
    const { decision, context, analysis } = req.body;
    
    if (!decision || !context || !analysis) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'decision, context, and analysis are required'
      });
    }
    
    const explanation = await reasoningEngine.explainReasoning(decision, context, analysis);
    
    res.json({
      success: true,
      data: {
        explanation,
        explainedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error explaining reasoning:', error);
    res.status(500).json({
      error: 'Reasoning explanation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/scenarios
 * Generate multiple scenario analysis
 */
router.post('/scenarios', async (req, res) => {
  try {
    const { symbol, timeframe, currentPrice, marketData, userPreferences } = req.body;
    
    if (!symbol || !timeframe || !currentPrice) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'symbol, timeframe, and currentPrice are required'
      });
    }
    
    const context: ReasoningContext = {
      symbol,
      timeframe,
      currentPrice,
      marketData,
      userPreferences
    };
    
    // First analyze the market
    const analysis = await reasoningEngine.analyzeMarket(context);
    
    // Then generate scenarios
    const scenarios = await reasoningEngine.generateScenarios(context, analysis);
    
    res.json({
      success: true,
      data: {
        scenarios,
        analysis,
        context,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating scenarios:', error);
    res.status(500).json({
      error: 'Scenario generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/position-size
 * Calculate position size based on risk management
 */
router.post('/position-size', async (req, res) => {
  try {
    const { accountBalance, riskPercentage, entryPrice, stopLoss } = req.body;
    
    if (!accountBalance || !riskPercentage || !entryPrice || !stopLoss) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'accountBalance, riskPercentage, entryPrice, and stopLoss are required'
      });
    }
    
    const positionSize = reasoningEngine.calculatePositionSize(
      accountBalance,
      riskPercentage,
      entryPrice,
      stopLoss
    );
    
    const riskAmount = accountBalance * (riskPercentage / 100);
    const priceRisk = Math.abs(entryPrice - stopLoss);
    const riskRewardRatio = priceRisk > 0 ? Math.abs(entryPrice - stopLoss) / priceRisk : 0;
    
    res.json({
      success: true,
      data: {
        positionSize,
        riskAmount,
        priceRisk,
        riskRewardRatio,
        calculatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error calculating position size:', error);
    res.status(500).json({
      error: 'Position size calculation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/historical-performance
 * Get historical performance of similar decisions
 */
router.post('/historical-performance', async (req, res) => {
  try {
    const { decision, context } = req.body;
    
    if (!decision || !context) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'decision and context are required'
      });
    }
    
    const performance = await reasoningEngine.getHistoricalPerformance(decision, context);
    
    res.json({
      success: true,
      data: {
        performance,
        retrievedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting historical performance:', error);
    res.status(500).json({
      error: 'Historical performance retrieval failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reasoning/complete-analysis
 * Perform complete ICT analysis and generate trading recommendation
 */
router.post('/complete-analysis', async (req, res) => {
  try {
    const { symbol, timeframe, currentPrice, marketData, userPreferences } = req.body;
    
    if (!symbol || !timeframe || !currentPrice) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'symbol, timeframe, and currentPrice are required'
      });
    }
    
    const context: ReasoningContext = {
      symbol,
      timeframe,
      currentPrice,
      marketData,
      userPreferences
    };
    
    // Perform complete analysis
    const analysis = await reasoningEngine.analyzeMarket(context);
    const decision = await reasoningEngine.generateTradingDecision(context, analysis);
    const validation = await reasoningEngine.validateDecision(decision, context, analysis);
    const explanation = await reasoningEngine.explainReasoning(decision, context, analysis);
    const scenarios = await reasoningEngine.generateScenarios(context, analysis);
    const performance = await reasoningEngine.getHistoricalPerformance(decision, context);
    
    // Calculate position size if we have the required data
    let positionSizing = null;
    if (userPreferences?.maxRisk && decision.entryPrice && decision.stopLoss) {
      const accountBalance = userPreferences.accountBalance || 10000; // Default balance
      const positionSize = reasoningEngine.calculatePositionSize(
        accountBalance,
        userPreferences.maxRisk,
        decision.entryPrice,
        decision.stopLoss
      );
      
      positionSizing = {
        positionSize,
        riskAmount: accountBalance * (userPreferences.maxRisk / 100),
        priceRisk: Math.abs(decision.entryPrice - decision.stopLoss)
      };
    }
    
    res.json({
      success: true,
      data: {
        context,
        analysis,
        decision,
        validation,
        explanation,
        scenarios,
        performance,
        positionSizing,
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error performing complete analysis:', error);
    res.status(500).json({
      error: 'Complete analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reasoning/health
 * Health check for reasoning service
 */
router.get('/health', async (req, res) => {
  try {
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          database: true, // Already checked in middleware
          vectorStore: true, // Already checked in middleware
          reasoningEngine: !!reasoningEngine,
          openai: openaiConfigured
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;