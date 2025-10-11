import { SupabaseDatabaseService } from '../services/supabase-database';
import { VectorStore } from '../embeddings/vector-store';
import { aiProvider, AIMessage } from '../services/ai-provider';

export interface TradingDecision {
  action: 'buy' | 'sell' | 'hold' | 'wait';
  confidence: number;
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  timeframe: string;
  validUntil?: string;
}

export interface MarketAnalysis {
  marketStructure: {
    trend: 'bullish' | 'bearish' | 'ranging';
    strength: number;
    keyLevels: number[];
  };
  liquidity: {
    buyLiquidity: number[];
    sellLiquidity: number[];
    liquidityVoids: number[];
  };
  orderBlocks: {
    bullishBlocks: Array<{ price: number; strength: number; timeframe: string }>;
    bearishBlocks: Array<{ price: number; strength: number; timeframe: string }>;
  };
  fairValueGaps: {
    gaps: Array<{ high: number; low: number; type: 'bullish' | 'bearish'; filled: boolean }>;
  };
  institutionalFlow: {
    direction: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    evidence: string[];
  };
}

export interface ReasoningContext {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  marketData?: {
    high: number;
    low: number;
    volume: number;
    timestamp: string;
  };
  userPreferences?: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    tradingStyle: 'scalping' | 'day' | 'swing' | 'position';
    maxRisk: number;
  };
}

export class ICTReasoningEngine {
  private dbService: SupabaseDatabaseService;
  private vectorStore: VectorStore;

  constructor(dbService: SupabaseDatabaseService, vectorStore: VectorStore) {
    this.dbService = dbService;
    this.vectorStore = vectorStore;
    
    // Check if at least one AI provider is available
    const availableProviders = aiProvider.getAvailableProviders();
    if (availableProviders.length === 0) {
      throw new Error('At least one AI provider (OpenAI or Gemini) must be configured');
    }
    
    console.log(`✅ ICT Reasoning Engine initialized with providers: ${availableProviders.join(', ')}`);
  }

  /**
   * Analyze market conditions using ICT concepts
   */
  public async analyzeMarket(context: ReasoningContext): Promise<MarketAnalysis> {
    try {
      // Get relevant ICT concepts for market analysis
      const relevantConcepts = await this.getRelevantConcepts([
        'market structure', 'liquidity', 'order block', 'fair value gap', 'institutional flow'
      ]);

      // Simulate market analysis (in a real implementation, this would use actual market data)
      const analysis: MarketAnalysis = {
        marketStructure: await this.analyzeMarketStructure(context),
        liquidity: await this.analyzeLiquidity(context),
        orderBlocks: await this.analyzeOrderBlocks(context),
        fairValueGaps: await this.analyzeFairValueGaps(context),
        institutionalFlow: await this.analyzeInstitutionalFlow(context)
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    }
  }

  /**
   * Generate trading decision based on ICT analysis
   */
  public async generateTradingDecision(
    context: ReasoningContext,
    analysis?: MarketAnalysis
  ): Promise<TradingDecision> {
    try {
      // Get market analysis if not provided
      const marketAnalysis = analysis || await this.analyzeMarket(context);
      
      // Get relevant trading models and techniques
      const tradingModels = await this.dbService.getAllTradingModels();
      const entryTechniques = await this.dbService.getAllEntryTechniques();
      
      // Use AI to generate trading decision
      const decision = await this.generateAIDecision(context, marketAnalysis, tradingModels, entryTechniques);
      
      return decision;
    } catch (error) {
      console.error('Error generating trading decision:', error);
      throw error;
    }
  }

  /**
   * Validate trading decision against ICT principles
   */
  public async validateDecision(
    decision: TradingDecision,
    context: ReasoningContext,
    analysis: MarketAnalysis
  ): Promise<{
    isValid: boolean;
    validationScore: number;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const validation = {
        isValid: true,
        validationScore: 1.0,
        issues: [] as string[],
        suggestions: [] as string[]
      };

      // Validate against market structure
      if (decision.action === 'buy' && analysis.marketStructure.trend === 'bearish') {
        validation.issues.push('Buying against bearish market structure');
        validation.validationScore -= 0.3;
      }

      if (decision.action === 'sell' && analysis.marketStructure.trend === 'bullish') {
        validation.issues.push('Selling against bullish market structure');
        validation.validationScore -= 0.3;
      }

      // Validate risk management
      if (decision.riskLevel === 'high' && context.userPreferences?.riskTolerance === 'conservative') {
        validation.issues.push('High risk decision for conservative risk tolerance');
        validation.validationScore -= 0.2;
      }

      // Validate entry timing
      if (decision.action !== 'wait' && analysis.institutionalFlow.direction === 'neutral') {
        validation.suggestions.push('Consider waiting for clearer institutional flow direction');
        validation.validationScore -= 0.1;
      }

      // Validate liquidity considerations
      if (decision.entryPrice && analysis.liquidity.liquidityVoids.length > 0) {
        const nearLiquidityVoid = analysis.liquidity.liquidityVoids.some(
          voidLevel => Math.abs(voidLevel - decision.entryPrice!) < (decision.entryPrice! * 0.001)
        );
        
        if (nearLiquidityVoid) {
          validation.suggestions.push('Entry price is near a liquidity void - consider adjustment');
        }
      }

      validation.isValid = validation.validationScore >= 0.6;
      
      return validation;
    } catch (error) {
      console.error('Error validating decision:', error);
      throw error;
    }
  }

  /**
   * Get reasoning explanation for a trading decision
   */
  public async explainReasoning(
    decision: TradingDecision,
    context: ReasoningContext,
    analysis: MarketAnalysis
  ): Promise<{
    summary: string;
    detailedExplanation: string;
    ictConcepts: string[];
    riskAssessment: string;
    alternativeScenarios: string[];
  }> {
    try {
      const prompt = `
As an ICT trading expert, explain this trading decision in detail:

Decision: ${decision.action.toUpperCase()} ${context.symbol}
Confidence: ${decision.confidence}
Risk Level: ${decision.riskLevel}
Timeframe: ${decision.timeframe}

Market Analysis:
- Trend: ${analysis.marketStructure.trend}
- Institutional Flow: ${analysis.institutionalFlow.direction}
- Order Blocks: ${analysis.orderBlocks.bullishBlocks.length} bullish, ${analysis.orderBlocks.bearishBlocks.length} bearish
- Fair Value Gaps: ${analysis.fairValueGaps.gaps.length} identified

Context:
- Current Price: ${context.currentPrice}
- User Risk Tolerance: ${context.userPreferences?.riskTolerance || 'moderate'}

Please provide:
1. A concise summary of why this decision was made
2. Detailed explanation using ICT concepts
3. List of key ICT concepts involved
4. Risk assessment explanation
5. Alternative scenarios to consider

Format as JSON:
{
  "summary": "brief explanation",
  "detailedExplanation": "comprehensive analysis",
  "ictConcepts": ["concept1", "concept2"],
  "riskAssessment": "risk analysis",
  "alternativeScenarios": ["scenario1", "scenario2"]
}
`;

      const response = await aiProvider.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 1500
      });

      const content = response.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error explaining reasoning:', error);
      // Return fallback explanation
      return {
        summary: `${decision.action.toUpperCase()} decision based on ${decision.reasoning.join(', ')}`,
        detailedExplanation: decision.reasoning.join('. '),
        ictConcepts: ['Market Structure', 'Institutional Flow'],
        riskAssessment: `Risk level: ${decision.riskLevel}. Confidence: ${decision.confidence}`,
        alternativeScenarios: ['Wait for better confirmation', 'Consider opposite direction']
      };
    }
  }

  /**
   * Analyze market structure
   */
  private async analyzeMarketStructure(context: ReasoningContext): Promise<MarketAnalysis['marketStructure']> {
    // Simulate market structure analysis
    // In a real implementation, this would analyze actual price data
    
    const trends = ['bullish', 'bearish', 'ranging'] as const;
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      trend,
      strength: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      keyLevels: [
        context.currentPrice * 0.98,
        context.currentPrice * 0.99,
        context.currentPrice,
        context.currentPrice * 1.01,
        context.currentPrice * 1.02
      ]
    };
  }

  /**
   * Analyze liquidity levels
   */
  private async analyzeLiquidity(context: ReasoningContext): Promise<MarketAnalysis['liquidity']> {
    return {
      buyLiquidity: [
        context.currentPrice * 0.995,
        context.currentPrice * 0.99,
        context.currentPrice * 0.985
      ],
      sellLiquidity: [
        context.currentPrice * 1.005,
        context.currentPrice * 1.01,
        context.currentPrice * 1.015
      ],
      liquidityVoids: [
        context.currentPrice * 0.997,
        context.currentPrice * 1.003
      ]
    };
  }

  /**
   * Analyze order blocks
   */
  private async analyzeOrderBlocks(context: ReasoningContext): Promise<MarketAnalysis['orderBlocks']> {
    return {
      bullishBlocks: [
        { price: context.currentPrice * 0.99, strength: 0.8, timeframe: '1H' },
        { price: context.currentPrice * 0.985, strength: 0.6, timeframe: '4H' }
      ],
      bearishBlocks: [
        { price: context.currentPrice * 1.01, strength: 0.7, timeframe: '1H' },
        { price: context.currentPrice * 1.015, strength: 0.9, timeframe: '4H' }
      ]
    };
  }

  /**
   * Analyze fair value gaps
   */
  private async analyzeFairValueGaps(context: ReasoningContext): Promise<MarketAnalysis['fairValueGaps']> {
    return {
      gaps: [
        {
          high: context.currentPrice * 1.002,
          low: context.currentPrice * 0.998,
          type: 'bullish',
          filled: false
        },
        {
          high: context.currentPrice * 1.008,
          low: context.currentPrice * 1.005,
          type: 'bearish',
          filled: true
        }
      ]
    };
  }

  /**
   * Analyze institutional flow
   */
  private async analyzeInstitutionalFlow(context: ReasoningContext): Promise<MarketAnalysis['institutionalFlow']> {
    const directions = ['bullish', 'bearish', 'neutral'] as const;
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    return {
      direction,
      strength: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      evidence: [
        'Large order flow detected',
        'Liquidity manipulation patterns',
        'Smart money accumulation/distribution'
      ]
    };
  }

  /**
   * Generate AI-powered trading decision
   */
  private async generateAIDecision(
    context: ReasoningContext,
    analysis: MarketAnalysis,
    tradingModels: any[],
    entryTechniques: any[]
  ): Promise<TradingDecision> {
    const prompt = `
As an expert ICT trader, analyze this market situation and provide a trading decision:

Symbol: ${context.symbol}
Current Price: ${context.currentPrice}
Timeframe: ${context.timeframe}

Market Analysis:
- Trend: ${analysis.marketStructure.trend} (strength: ${analysis.marketStructure.strength})
- Institutional Flow: ${analysis.institutionalFlow.direction} (strength: ${analysis.institutionalFlow.strength})
- Key Levels: ${analysis.marketStructure.keyLevels.join(', ')}
- Order Blocks: ${analysis.orderBlocks.bullishBlocks.length} bullish, ${analysis.orderBlocks.bearishBlocks.length} bearish
- Fair Value Gaps: ${analysis.fairValueGaps.gaps.length} gaps identified

User Preferences:
- Risk Tolerance: ${context.userPreferences?.riskTolerance || 'moderate'}
- Trading Style: ${context.userPreferences?.tradingStyle || 'day'}
- Max Risk: ${context.userPreferences?.maxRisk || 2}%

Based on ICT principles, provide a trading decision in JSON format:
{
  "action": "buy|sell|hold|wait",
  "confidence": 0.85,
  "reasoning": ["reason1", "reason2", "reason3"],
  "riskLevel": "low|medium|high",
  "entryPrice": 1.2345,
  "stopLoss": 1.2300,
  "takeProfit": 1.2400,
  "positionSize": 1.0,
  "timeframe": "${context.timeframe}",
  "validUntil": "2024-01-01T12:00:00Z"
}
`;

    try {
      const response = await aiProvider.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 800
      });

      const content = response.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating AI decision:', error);
      
      // Fallback decision
      return {
        action: 'wait',
        confidence: 0.5,
        reasoning: ['Insufficient data for confident decision'],
        riskLevel: 'medium',
        timeframe: context.timeframe,
        validUntil: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      };
    }
  }

  /**
   * Get relevant ICT concepts from vector store
   */
  private async getRelevantConcepts(keywords: string[]): Promise<any[]> {
    const concepts = [];
    
    for (const keyword of keywords) {
      try {
        const results = await this.vectorStore.search(keyword, {
          limit: 3,
          threshold: 0.7,
          type: ['definition', 'concept']
        });
        concepts.push(...results.map(r => r.document));
      } catch (error) {
        console.warn(`Could not find concepts for keyword: ${keyword}`);
      }
    }
    
    return concepts;
  }

  /**
   * Calculate position size based on risk management
   */
  public calculatePositionSize(
    accountBalance: number,
    riskPercentage: number,
    entryPrice: number,
    stopLoss: number
  ): number {
    const riskAmount = accountBalance * (riskPercentage / 100);
    const priceRisk = Math.abs(entryPrice - stopLoss);
    
    if (priceRisk === 0) return 0;
    
    return riskAmount / priceRisk;
  }

  /**
   * Get historical performance of similar decisions
   */
  public async getHistoricalPerformance(
    decision: TradingDecision,
    context: ReasoningContext
  ): Promise<{
    similarDecisions: number;
    successRate: number;
    averageReturn: number;
    averageHoldTime: number;
  }> {
    // In a real implementation, this would query historical trade data
    // For now, return simulated data
    
    return {
      similarDecisions: Math.floor(Math.random() * 100) + 50,
      successRate: Math.random() * 0.3 + 0.6, // 60-90%
      averageReturn: Math.random() * 0.04 + 0.01, // 1-5%
      averageHoldTime: Math.random() * 24 + 1 // 1-25 hours
    };
  }

  /**
   * Generate multiple scenario analysis
   */
  public async generateScenarios(
    context: ReasoningContext,
    analysis: MarketAnalysis
  ): Promise<Array<{
    scenario: string;
    probability: number;
    decision: TradingDecision;
    outcome: string;
  }>> {
    const scenarios = [
      {
        scenario: 'Bullish breakout above resistance',
        probability: 0.3,
        decision: await this.generateTradingDecision({
          ...context,
          currentPrice: context.currentPrice * 1.01
        }),
        outcome: 'Strong upward movement expected'
      },
      {
        scenario: 'Bearish rejection at resistance',
        probability: 0.4,
        decision: await this.generateTradingDecision({
          ...context,
          currentPrice: context.currentPrice * 0.99
        }),
        outcome: 'Downward movement to support levels'
      },
      {
        scenario: 'Sideways consolidation',
        probability: 0.3,
        decision: {
          action: 'wait' as const,
          confidence: 0.7,
          reasoning: ['Market consolidation expected'],
          riskLevel: 'low' as const,
          timeframe: context.timeframe
        },
        outcome: 'Range-bound trading continues'
      }
    ];

    return scenarios;
  }
}