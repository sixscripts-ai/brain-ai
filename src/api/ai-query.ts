import express from 'express';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { AuthService } from '../services/auth';
import { KnowledgeGraphService } from '../knowledge/graph';
import { AIQueryInterface, QueryContext } from '../services/ai-query-interface';

const router = express.Router();

// Initialize services (these would be injected in a real application)
let dbService: SupabaseDatabaseService;
let authService: AuthService;
let knowledgeGraph: KnowledgeGraphService;
let aiQuery: AIQueryInterface;

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
    
    if (!knowledgeGraph) {
      knowledgeGraph = new KnowledgeGraphService(dbService);
    }
    
    if (!aiQuery) {
      aiQuery = new AIQueryInterface(dbService, knowledgeGraph);
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to initialize AI query services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai-query/ask
 * Process a natural language query about ICT trading
 */
router.post('/ask', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Query parameter is required and must be a string'
      });
    }

    // Extract user ID from authenticated request if available
    let userId = context?.userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const user = await authService.verifyToken(token);
        userId = user?.id;
      } catch (error) {
        // Token invalid or expired, continue as anonymous user
        console.log('Invalid or expired token, continuing as anonymous user');
      }
    }
    
    const queryContext: QueryContext = {
      userId: userId,
      sessionId: context?.sessionId || `session_${Date.now()}`,
      previousQueries: context?.previousQueries || [],
      tradingExperience: context?.tradingExperience || 'intermediate',
      preferredStyle: context?.preferredStyle || 'detailed'
    };
    
    const result = await aiQuery.processQuery(query, queryContext);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai-query/batch
 * Process multiple queries in batch
 */
router.post('/batch', async (req, res) => {
  try {
    const { queries, context } = req.body;
    
    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Queries parameter must be a non-empty array'
      });
    }
    
    if (queries.length > 10) {
      return res.status(400).json({
        error: 'Too many queries',
        message: 'Maximum 10 queries allowed per batch request'
      });
    }
    
    const queryContext: QueryContext = {
      userId: context?.userId,
      sessionId: context?.sessionId || `batch_session_${Date.now()}`,
      tradingExperience: context?.tradingExperience || 'intermediate',
      preferredStyle: context?.preferredStyle || 'concise'
    };
    
    const results = await aiQuery.batchProcessQueries(queries, queryContext);
    
    res.json({
      success: true,
      data: {
        results,
        totalQueries: queries.length,
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing batch queries:', error);
    res.status(500).json({
      error: 'Failed to process batch queries',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-query/analytics
 * Get query analytics and statistics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe } = req.query;
    const validTimeframes = ['day', 'week', 'month'];
    const selectedTimeframe = validTimeframes.includes(timeframe as string) 
      ? (timeframe as 'day' | 'week' | 'month') 
      : 'day';
    
    const analytics = await aiQuery.getQueryAnalytics(selectedTimeframe);
    
    res.json({
      success: true,
      data: {
        ...analytics,
        timeframe: selectedTimeframe,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting query analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai-query/feedback
 * Submit feedback on query results
 */
router.post('/feedback', async (req, res) => {
  try {
    const { queryId, sessionId, rating, feedback, helpful } = req.body;
    
    if (!queryId || !sessionId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'queryId and sessionId are required'
      });
    }
    
    // In a real application, this would store feedback in a database
    const feedbackRecord = {
      queryId,
      sessionId,
      rating: rating || null,
      feedback: feedback || null,
      helpful: helpful || null,
      timestamp: new Date().toISOString()
    };
    
    console.log('Query feedback received:', feedbackRecord);
    
    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: { feedbackId: `feedback_${Date.now()}` }
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({
      error: 'Failed to record feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-query/suggestions
 * Get suggested queries based on popular topics
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { category, experience } = req.query;
    
    // Predefined suggestions based on ICT concepts
    const suggestions = {
      beginner: [
        "What is an Order Block in ICT trading?",
        "How do I identify Fair Value Gaps?",
        "What is the difference between premium and discount in ICT?",
        "How does Smart Money move the market?",
        "What are the basic ICT market structure concepts?"
      ],
      intermediate: [
        "How do I trade Order Block mitigation?",
        "What's the relationship between liquidity and market structure?",
        "How do I identify institutional order flow?",
        "What are the best entry techniques for ICT patterns?",
        "How do I combine multiple ICT concepts in my trading?"
      ],
      advanced: [
        "How do I analyze multi-timeframe Order Block confluence?",
        "What are advanced liquidity manipulation techniques?",
        "How do I identify algorithmic price delivery patterns?",
        "What's the psychology behind institutional order flow?",
        "How do I develop a complete ICT trading model?"
      ]
    };
    
    const categoryMap: Record<string, string[]> = {
      'order-blocks': [
        "How do I identify valid Order Blocks?",
        "What makes an Order Block strong or weak?",
        "How do I trade Order Block mitigation?"
      ],
      'fair-value-gaps': [
        "What are the different types of Fair Value Gaps?",
        "How do I measure FVG significance?",
        "When do Fair Value Gaps get filled?"
      ],
      'market-structure': [
        "How do I identify Break of Structure?",
        "What is Change of Character in ICT?",
        "How do I read market structure shifts?"
      ],
      'liquidity': [
        "Where is liquidity typically located?",
        "How do institutions hunt for liquidity?",
        "What are liquidity voids and how to trade them?"
      ]
    };
    
    let selectedSuggestions: string[] = [];
    
    if (category && categoryMap[category as string]) {
      selectedSuggestions = categoryMap[category as string];
    } else if (experience && suggestions[experience as keyof typeof suggestions]) {
      selectedSuggestions = suggestions[experience as keyof typeof suggestions];
    } else {
      // Default to intermediate suggestions
      selectedSuggestions = suggestions.intermediate;
    }
    
    res.json({
      success: true,
      data: {
        suggestions: selectedSuggestions,
        category: category || 'general',
        experience: experience || 'intermediate'
      }
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-query/health
 * Health check for AI query service
 */
router.get('/health', async (req, res) => {
  try {
    // Check if OpenAI API key is configured
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    // Check database connection
    const dbHealth = await dbService.healthCheck();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          database: dbHealth === true,
          openai: openaiConfigured,
          knowledgeGraph: !!knowledgeGraph
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