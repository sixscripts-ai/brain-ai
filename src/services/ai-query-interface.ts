import { SupabaseDatabaseService } from './supabase-database';
import { KnowledgeGraphService } from '../knowledge/graph';
import { aiProvider, AIMessage } from './ai-provider';

export interface QueryResult {
  answer: string;
  confidence: number;
  sources: string[];
  relatedConcepts: string[];
  suggestedQueries: string[];
  metadata: {
    queryType: string;
    processingTime: number;
    tokensUsed?: number;
  };
}

export interface QueryContext {
  userId?: string;
  sessionId?: string;
  previousQueries?: string[];
  tradingExperience?: 'beginner' | 'intermediate' | 'advanced';
  preferredStyle?: 'concise' | 'detailed' | 'educational';
}

export class AIQueryInterface {
  private dbService: SupabaseDatabaseService;
  private knowledgeGraph: KnowledgeGraphService;

  constructor(dbService: SupabaseDatabaseService, knowledgeGraph: KnowledgeGraphService) {
    this.dbService = dbService;
    this.knowledgeGraph = knowledgeGraph;
    
    // Check if at least one AI provider is available
    const availableProviders = aiProvider.getAvailableProviders();
    if (availableProviders.length === 0) {
      throw new Error('At least one AI provider (OpenAI or Gemini) must be configured');
    }
    
    console.log(`✅ AI Query Interface initialized with providers: ${availableProviders.join(', ')}`);
  }

  /**
   * Process a natural language query about ICT trading concepts
   */
  public async processQuery(query: string, context?: QueryContext): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // 1. Analyze query intent and extract key concepts
      const queryAnalysis = await this.analyzeQuery(query);
      
      // 2. Retrieve relevant knowledge from database and knowledge graph
      const relevantKnowledge = await this.retrieveRelevantKnowledge(queryAnalysis);
      
      // 3. Generate contextual response using OpenAI
      const response = await this.generateResponse(query, relevantKnowledge, context);
      
      // 4. Extract related concepts and suggest follow-up queries
      const relatedConcepts = await this.findRelatedConcepts(queryAnalysis.concepts);
      const suggestedQueries = await this.generateSuggestedQueries(query, queryAnalysis);
      
      const processingTime = Date.now() - startTime;
      
      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: relevantKnowledge.sources,
        relatedConcepts,
        suggestedQueries,
        metadata: {
          queryType: queryAnalysis.type,
          processingTime,
          tokensUsed: response.tokensUsed
        }
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze the query to understand intent and extract key concepts
   */
  private async analyzeQuery(query: string): Promise<{
    type: string;
    concepts: string[];
    intent: string;
    complexity: 'simple' | 'moderate' | 'complex';
  }> {
    const prompt = `
Analyze this ICT trading query and extract key information:

Query: "${query}"

Please identify:
1. Query type (definition, explanation, comparison, strategy, pattern, example, troubleshooting)
2. Key ICT concepts mentioned (e.g., "Order Block", "Fair Value Gap", "Liquidity", "Smart Money")
3. User intent (learn, understand, apply, compare, troubleshoot)
4. Complexity level (simple, moderate, complex)

Respond in JSON format:
{
  "type": "query_type",
  "concepts": ["concept1", "concept2"],
  "intent": "user_intent",
  "complexity": "complexity_level"
}
`;

    try {
      const response = await aiProvider.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        maxTokens: 300
      });

      const content = response.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing query:', error);
      // Fallback analysis
      return {
        type: 'general',
        concepts: this.extractConceptsFromText(query),
        intent: 'understand',
        complexity: 'moderate'
      };
    }
  }

  /**
   * Retrieve relevant knowledge from database and knowledge graph
   */
  private async retrieveRelevantKnowledge(queryAnalysis: any): Promise<{
    definitions: any[];
    models: any[];
    patterns: any[];
    techniques: any[];
    examples: any[];
    sources: string[];
  }> {
    const knowledge = {
      definitions: [] as any[],
      models: [] as any[],
      patterns: [] as any[],
      techniques: [] as any[],
      examples: [] as any[],
      sources: [] as string[]
    };

    try {
      // Search for relevant definitions
      for (const concept of queryAnalysis.concepts) {
        const definitions = await this.dbService.searchICTDefinitions(concept);
        knowledge.definitions.push(...definitions);
        
        const models = await this.dbService.searchTradingModels(concept);
        knowledge.models.push(...models);
        
        const patterns = await this.dbService.searchPatterns(concept);
        knowledge.patterns.push(...patterns);
        
        const techniques = await this.dbService.searchEntryTechniques(concept);
        knowledge.techniques.push(...techniques);
      }

      // Get related nodes from knowledge graph
      for (const concept of queryAnalysis.concepts) {
        try {
          const relatedNodes = await this.knowledgeGraph.getRelatedNodes(concept);
          knowledge.examples.push(...relatedNodes);
        } catch (error) {
          console.warn(`Could not find related nodes for concept: ${concept}`);
        }
      }

      // Build sources list
      knowledge.sources = [
        ...knowledge.definitions.map(d => `ICT Definition: ${d.concept}`),
        ...knowledge.models.map(m => `Trading Model: ${m.model_name}`),
        ...knowledge.patterns.map(p => `Pattern: ${p.pattern_name}`),
        ...knowledge.techniques.map(t => `Entry Technique: ${t.technique_name}`)
      ];

      return knowledge;
    } catch (error) {
      console.error('Error retrieving knowledge:', error);
      return knowledge;
    }
  }

  /**
   * Generate response using OpenAI with retrieved knowledge
   */
  private async generateResponse(
    query: string, 
    knowledge: any, 
    context?: QueryContext
  ): Promise<{
    answer: string;
    confidence: number;
    tokensUsed?: number;
  }> {
    const knowledgeContext = this.formatKnowledgeForPrompt(knowledge);
    const userContext = this.formatUserContext(context);
    
    const prompt = `
You are an expert ICT (Inner Circle Trader) trading educator. Answer the user's question using the provided knowledge base.

${userContext}

User Question: "${query}"

Available Knowledge:
${knowledgeContext}

Instructions:
1. Provide a clear, accurate answer based on the knowledge provided
2. Use ICT terminology correctly
3. Include practical examples when relevant
4. Adjust complexity based on user experience level
5. If knowledge is insufficient, clearly state limitations
6. Maintain educational tone
7. Include actionable insights when possible

Format your response as JSON:
{
  "answer": "detailed_answer_here",
  "confidence": 0.85
}
`;

    try {
      const response = await aiProvider.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 1000
      });

      const content = response.content;
      if (!content) {
        throw new Error('No response from AI provider');
      }

      const parsed = JSON.parse(content);
      
      return {
        answer: parsed.answer,
        confidence: parsed.confidence || 0.7,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        answer: 'I apologize, but I encountered an error while processing your question. Please try rephrasing your query or contact support.',
        confidence: 0.1
      };
    }
  }

  /**
   * Find related concepts using knowledge graph
   */
  private async findRelatedConcepts(concepts: string[]): Promise<string[]> {
    const relatedConcepts = new Set<string>();
    
    for (const concept of concepts) {
      try {
        const related = await this.knowledgeGraph.getRelatedNodes(concept);
        related.forEach(node => {
          if (node.label && !concepts.includes(node.label)) {
            relatedConcepts.add(node.label);
          }
        });
      } catch (error) {
        console.warn(`Could not find related concepts for: ${concept}`);
      }
    }
    
    return Array.from(relatedConcepts).slice(0, 5);
  }

  /**
   * Generate suggested follow-up queries
   */
  private async generateSuggestedQueries(originalQuery: string, analysis: any): Promise<string[]> {
    const prompt = `
Based on this ICT trading query and analysis, suggest 3 relevant follow-up questions:

Original Query: "${originalQuery}"
Query Type: ${analysis.type}
Concepts: ${analysis.concepts.join(', ')}

Generate questions that would help the user:
1. Deepen their understanding
2. Learn practical applications
3. Explore related concepts

Format as JSON array: ["question1", "question2", "question3"]
`;

    try {
      const response = await aiProvider.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        maxTokens: 200
      });

      const content = response.content;
      if (!content) {
        return this.getDefaultSuggestedQueries(analysis.concepts);
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating suggested queries:', error);
      return this.getDefaultSuggestedQueries(analysis.concepts);
    }
  }

  /**
   * Extract concepts from text using simple pattern matching
   */
  private extractConceptsFromText(text: string): string[] {
    const ictTerms = [
      'Order Block', 'Fair Value Gap', 'Liquidity', 'Smart Money', 'Institutional Order Flow',
      'Market Structure', 'Break of Structure', 'Change of Character', 'Inducement',
      'Mitigation', 'Premium', 'Discount', 'Equilibrium', 'Imbalance', 'Inefficiency',
      'Swing High', 'Swing Low', 'Higher High', 'Higher Low', 'Lower High', 'Lower Low',
      'Bullish Order Block', 'Bearish Order Block', 'Breaker Block', 'Mitigation Block'
    ];

    const foundConcepts = [];
    const lowerText = text.toLowerCase();
    
    for (const term of ictTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        foundConcepts.push(term);
      }
    }
    
    return foundConcepts;
  }

  /**
   * Format knowledge for prompt
   */
  private formatKnowledgeForPrompt(knowledge: any): string {
    let formatted = '';
    
    if (knowledge.definitions.length > 0) {
      formatted += 'DEFINITIONS:\n';
      knowledge.definitions.forEach((def: any) => {
        formatted += `- ${def.concept}: ${def.definition}\n`;
      });
      formatted += '\n';
    }
    
    if (knowledge.models.length > 0) {
      formatted += 'TRADING MODELS:\n';
      knowledge.models.forEach((model: any) => {
        formatted += `- ${model.model_name}: ${model.description}\n`;
      });
      formatted += '\n';
    }
    
    if (knowledge.patterns.length > 0) {
      formatted += 'PATTERNS:\n';
      knowledge.patterns.forEach((pattern: any) => {
        formatted += `- ${pattern.pattern_name}: ${pattern.description}\n`;
      });
      formatted += '\n';
    }
    
    if (knowledge.techniques.length > 0) {
      formatted += 'ENTRY TECHNIQUES:\n';
      knowledge.techniques.forEach((technique: any) => {
        formatted += `- ${technique.technique_name}: ${technique.description}\n`;
      });
    }
    
    return formatted || 'No specific knowledge found in database.';
  }

  /**
   * Format user context for prompt
   */
  private formatUserContext(context?: QueryContext): string {
    if (!context) return '';
    
    let formatted = 'USER CONTEXT:\n';
    
    if (context.tradingExperience) {
      formatted += `- Experience Level: ${context.tradingExperience}\n`;
    }
    
    if (context.preferredStyle) {
      formatted += `- Preferred Response Style: ${context.preferredStyle}\n`;
    }
    
    return formatted + '\n';
  }

  /**
   * Get default suggested queries when AI generation fails
   */
  private getDefaultSuggestedQueries(concepts: string[]): string[] {
    const defaults = [
      'How do I identify this pattern in real market conditions?',
      'What are the common mistakes when trading this concept?',
      'Can you show me examples of this in different market conditions?'
    ];
    
    if (concepts.length > 0) {
      defaults[0] = `How does ${concepts[0]} relate to market structure?`;
    }
    
    return defaults;
  }

  /**
   * Batch process multiple queries for training or analysis
   */
  public async batchProcessQueries(queries: string[], context?: QueryContext): Promise<QueryResult[]> {
    const results: QueryResult[] = [];
    
    for (const query of queries) {
      try {
        const result = await this.processQuery(query, context);
        results.push(result);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing query "${query}":`, error);
        results.push({
          answer: 'Error processing this query',
          confidence: 0,
          sources: [],
          relatedConcepts: [],
          suggestedQueries: [],
          metadata: {
            queryType: 'error',
            processingTime: 0
          }
        });
      }
    }
    
    return results;
  }

  /**
   * Get query statistics and analytics
   */
  public async getQueryAnalytics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalQueries: number;
    averageConfidence: number;
    topConcepts: string[];
    queryTypes: Record<string, number>;
    averageProcessingTime: number;
  }> {
    // This would typically connect to a logging/analytics database
    // For now, return mock data structure
    return {
      totalQueries: 0,
      averageConfidence: 0,
      topConcepts: [],
      queryTypes: {},
      averageProcessingTime: 0
    };
  }
}