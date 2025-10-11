import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ICTDefinition, 
  ICTTradingModel, 
  ICTEntryTechnique, 
  ICTPattern, 
  ICTTimeWindow, 
  ICTTrade 
} from '../types';

export class SupabaseDatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('ict_definitions')
        .select('count', { count: 'exact', head: true });
      
      return !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // ICT Definitions
  async getAllDefinitions(): Promise<ICTDefinition[]> {
    const { data, error } = await this.supabase
      .from('ict_definitions')
      .select('*')
      .order('concept');

    if (error) throw new Error(`Failed to fetch definitions: ${error.message}`);
    return data || [];
  }

  async getDefinitionById(id: number): Promise<ICTDefinition | undefined> {
    const { data, error } = await this.supabase
      .from('ict_definitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch definition: ${error.message}`);
    }
    return data || undefined;
  }

  async getDefinitionByConcept(concept: string): Promise<ICTDefinition | undefined> {
    const { data, error } = await this.supabase
      .from('ict_definitions')
      .select('*')
      .eq('concept', concept)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch definition: ${error.message}`);
    }
    return data || undefined;
  }

  async searchDefinitions(searchTerm: string): Promise<ICTDefinition[]> {
    const { data, error } = await this.supabase
      .from('ict_definitions')
      .select('*')
      .or(`concept.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%,key_characteristics.ilike.%${searchTerm}%`)
      .order('concept');

    if (error) throw new Error(`Failed to search definitions: ${error.message}`);
    return data || [];
  }

  // Search methods for AI query interface
  async searchICTDefinitions(searchTerm: string): Promise<ICTDefinition[]> {
    const { data, error } = await this.supabase
      .from('ict_definitions')
      .select('*')
      .or(`concept.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%,key_characteristics.ilike.%${searchTerm}%`)
      .order('concept');

    if (error) throw new Error(`Failed to search definitions: ${error.message}`);
    return data || [];
  }

  async searchTradingModels(searchTerm: string): Promise<ICTTradingModel[]> {
    const { data, error } = await this.supabase
      .from('ict_trading_models')
      .select('*')
      .or(`model_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,market_conditions.ilike.%${searchTerm}%`)
      .order('model_name');

    if (error) throw new Error(`Failed to search trading models: ${error.message}`);
    return data || [];
  }

  async searchPatterns(searchTerm: string): Promise<ICTPattern[]> {
    const { data, error } = await this.supabase
      .from('ict_patterns')
      .select('*')
      .or(`pattern_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,formation_rules.ilike.%${searchTerm}%`)
      .order('pattern_name');

    if (error) throw new Error(`Failed to search patterns: ${error.message}`);
    return data || [];
  }

  async searchEntryTechniques(searchTerm: string): Promise<ICTEntryTechnique[]> {
    const { data, error } = await this.supabase
      .from('ict_entry_techniques')
      .select('*')
      .or(`technique_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,setup_requirements.ilike.%${searchTerm}%`)
      .order('technique_name');

    if (error) throw new Error(`Failed to search entry techniques: ${error.message}`);
    return data || [];
  }

  // ICT Trading Models
  async getAllTradingModels(): Promise<ICTTradingModel[]> {
    const { data, error } = await this.supabase
      .from('ict_trading_models')
      .select('*')
      .order('model_name');

    if (error) throw new Error(`Failed to fetch trading models: ${error.message}`);
    return data || [];
  }

  async getTradingModelById(id: number): Promise<ICTTradingModel | undefined> {
    const { data, error } = await this.supabase
      .from('ict_trading_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch trading model: ${error.message}`);
    }
    return data || undefined;
  }

  async getTradingModelsBySuccessRate(minRate: number): Promise<ICTTradingModel[]> {
    const { data, error } = await this.supabase
      .from('ict_trading_models')
      .select('*')
      .gte('success_rate', minRate)
      .order('success_rate', { ascending: false });

    if (error) throw new Error(`Failed to fetch trading models: ${error.message}`);
    return data || [];
  }

  // ICT Entry Techniques
  async getAllEntryTechniques(): Promise<ICTEntryTechnique[]> {
    const { data, error } = await this.supabase
      .from('ict_entry_techniques')
      .select('*')
      .order('technique_name');

    if (error) throw new Error(`Failed to fetch entry techniques: ${error.message}`);
    return data || [];
  }

  async getEntryTechniqueById(id: number): Promise<ICTEntryTechnique | undefined> {
    const { data, error } = await this.supabase
      .from('ict_entry_techniques')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch entry technique: ${error.message}`);
    }
    return data || undefined;
  }

  async getEntryTechniquesByDifficulty(difficulty: string): Promise<ICTEntryTechnique[]> {
    const { data, error } = await this.supabase
      .from('ict_entry_techniques')
      .select('*')
      .eq('difficulty_level', difficulty)
      .order('technique_name');

    if (error) throw new Error(`Failed to fetch entry techniques: ${error.message}`);
    return data || [];
  }

  // ICT Patterns
  async getAllPatterns(): Promise<ICTPattern[]> {
    const { data, error } = await this.supabase
      .from('ict_patterns')
      .select('*')
      .order('pattern_name');

    if (error) throw new Error(`Failed to fetch patterns: ${error.message}`);
    return data || [];
  }

  async getPatternById(id: number): Promise<ICTPattern | undefined> {
    const { data, error } = await this.supabase
      .from('ict_patterns')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch pattern: ${error.message}`);
    }
    return data || undefined;
  }

  async getPatternsByType(patternType: string): Promise<ICTPattern[]> {
    const { data, error } = await this.supabase
      .from('ict_patterns')
      .select('*')
      .eq('pattern_type', patternType)
      .order('reliability_score', { ascending: false });

    if (error) throw new Error(`Failed to fetch patterns: ${error.message}`);
    return data || [];
  }

  async getPatternsByReliability(minScore: number): Promise<ICTPattern[]> {
    const { data, error } = await this.supabase
      .from('ict_patterns')
      .select('*')
      .gte('reliability_score', minScore)
      .order('reliability_score', { ascending: false });

    if (error) throw new Error(`Failed to fetch patterns: ${error.message}`);
    return data || [];
  }

  // ICT Time Windows
  async getAllTimeWindows(): Promise<ICTTimeWindow[]> {
    const { data, error } = await this.supabase
      .from('ict_time_windows')
      .select('*')
      .order('start_time');

    if (error) throw new Error(`Failed to fetch time windows: ${error.message}`);
    return data || [];
  }

  async getTimeWindowById(id: number): Promise<ICTTimeWindow | undefined> {
    const { data, error } = await this.supabase
      .from('ict_time_windows')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch time window: ${error.message}`);
    }
    return data || undefined;
  }

  async getTimeWindowsBySession(session: string): Promise<ICTTimeWindow[]> {
    const { data, error } = await this.supabase
      .from('ict_time_windows')
      .select('*')
      .eq('market_session', session)
      .order('start_time');

    if (error) throw new Error(`Failed to fetch time windows: ${error.message}`);
    return data || [];
  }

  // ICT Trades
  async getAllTrades(): Promise<ICTTrade[]> {
    const { data, error } = await this.supabase
      .from('ict_trades')
      .select('*')
      .order('trade_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch trades: ${error.message}`);
    return data || [];
  }

  async getTradeById(id: number): Promise<ICTTrade | undefined> {
    const { data, error } = await this.supabase
      .from('ict_trades')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch trade: ${error.message}`);
    }
    return data || undefined;
  }

  async getTradesBySymbol(symbol: string): Promise<ICTTrade[]> {
    const { data, error } = await this.supabase
      .from('ict_trades')
      .select('*')
      .eq('symbol', symbol)
      .order('trade_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch trades: ${error.message}`);
    return data || [];
  }

  async getTradesByModel(model: string): Promise<ICTTrade[]> {
    const { data, error } = await this.supabase
      .from('ict_trades')
      .select('*')
      .eq('model_used', model)
      .order('trade_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch trades: ${error.message}`);
    return data || [];
  }

  async getTradesByDateRange(startDate: string, endDate: string): Promise<ICTTrade[]> {
    const { data, error } = await this.supabase
      .from('ict_trades')
      .select('*')
      .gte('trade_date', startDate)
      .lte('trade_date', endDate)
      .order('trade_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch trades: ${error.message}`);
    return data || [];
  }

  async getProfitableTrades(): Promise<ICTTrade[]> {
    const { data, error } = await this.supabase
      .from('ict_trades')
      .select('*')
      .gt('pnl', 0)
      .order('pnl', { ascending: false });

    if (error) throw new Error(`Failed to fetch profitable trades: ${error.message}`);
    return data || [];
  }

  // Analytics and Statistics
  async getTradeStatistics(): Promise<any> {
    // Return mock data since the RPC function doesn't exist yet
    return {
      total_trades: 0,
      win_rate: 0,
      total_pnl: 0,
      avg_risk_reward: 0,
      best_model: 'Order Block',
      best_pattern: 'Fair Value Gap'
    };
  }

  async getModelPerformance(): Promise<any[]> {
    // Return mock data since the RPC function doesn't exist yet
    return [
      {
        model_name: 'Order Block',
        total_trades: 0,
        win_rate: 0,
        avg_pnl: 0,
        avg_risk_reward: 0
      }
    ];
  }

  async getPatternAnalysis(): Promise<any[]> {
    // Return mock data since the RPC function doesn't exist yet
    return [
      {
        pattern_name: 'Fair Value Gap',
        total_occurrences: 0,
        success_rate: 0,
        avg_reliability: 0
      }
    ];
  }

  async getTimeWindowAnalysis(): Promise<any[]> {
    // Return mock data since the RPC function doesn't exist yet
    return [
      {
        window_name: 'London Open',
        total_trades: 0,
        win_rate: 0,
        avg_volatility: 0
      }
    ];
  }

  async getMonthlyPerformance(): Promise<any[]> {
    // Return mock data since the RPC function doesn't exist yet
    return [
      {
        month: '2024-01',
        total_trades: 0,
        win_rate: 0,
        total_pnl: 0
      }
    ];
  }

  // Knowledge Graph Data
  async getKnowledgeGraphData(): Promise<any> {
    try {
      const [definitions, models, techniques, patterns, timeWindows, trades] = await Promise.all([
        this.getAllDefinitions(),
        this.getAllTradingModels(),
        this.getAllEntryTechniques(),
        this.getAllPatterns(),
        this.getAllTimeWindows(),
        this.getAllTrades()
      ]);

      return {
        definitions,
        models,
        techniques,
        patterns,
        timeWindows,
        trades
      };
    } catch (error) {
      throw new Error(`Failed to fetch knowledge graph data: ${error}`);
    }
  }

  // Bulk operations for AI training
  async bulkInsertDefinitions(definitions: Omit<ICTDefinition, 'id'>[]): Promise<void> {
    const { error } = await this.supabase
      .from('ict_definitions')
      .insert(definitions);

    if (error) throw new Error(`Failed to bulk insert definitions: ${error.message}`);
  }

  async bulkInsertTradingModels(models: Omit<ICTTradingModel, 'id'>[]): Promise<void> {
    const { error } = await this.supabase
      .from('ict_trading_models')
      .insert(models);

    if (error) throw new Error(`Failed to bulk insert trading models: ${error.message}`);
  }

  async bulkInsertTrades(trades: Omit<ICTTrade, 'id'>[]): Promise<void> {
    const { error } = await this.supabase
      .from('ict_trades')
      .insert(trades);

    if (error) throw new Error(`Failed to bulk insert trades: ${error.message}`);
  }

  // Vector embeddings support
  async storeEmbedding(
    content: string, 
    embedding: number[], 
    metadata: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('embeddings')
      .insert({
        content,
        embedding,
        metadata,
        created_at: new Date().toISOString()
      });

    if (error) throw new Error(`Failed to store embedding: ${error.message}`);
  }

  async searchSimilarEmbeddings(
    queryEmbedding: number[], 
    limit: number = 10,
    threshold: number = 0.8
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit
      });

    if (error) throw new Error(`Failed to search embeddings: ${error.message}`);
    return data || [];
  }

  // Real-time subscriptions
  subscribeToTrades(callback: (payload: any) => void) {
    return this.supabase
      .channel('trades')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ict_trades' }, 
        callback
      )
      .subscribe();
  }

  subscribeToDefinitions(callback: (payload: any) => void) {
    return this.supabase
      .channel('definitions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ict_definitions' }, 
        callback
      )
      .subscribe();
  }

  // User management (for multi-user support)
  async createUser(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata
    });

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }

  async getUserById(userId: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    
    if (error) throw new Error(`Failed to get user: ${error.message}`);
    return data;
  }

  // Generic query method for compatibility
  async query(sql: string, params?: any[]): Promise<any[]> {
    try {
      // For Supabase, we'll use RPC for custom SQL queries
      // This is a simplified implementation - in production, you'd want to use
      // Supabase's query builder or create specific RPC functions
      const { data, error } = await this.supabase.rpc('execute_sql', {
        sql_query: sql,
        parameters: params || []
      });

      if (error) throw new Error(`Query failed: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Get all concepts for training data generation
  async getAllConceptsForTraining(): Promise<any[]> {
    try {
      const [definitions, models, techniques, patterns] = await Promise.all([
        this.getAllDefinitions(),
        this.getAllTradingModels(),
        this.getAllEntryTechniques(),
        this.getAllPatterns()
      ]);

      const concepts: any[] = [];

      // Add definitions
      definitions.forEach(def => {
        concepts.push({
          id: def.id,
          type: 'definition',
          name: def.concept,
          description: def.definition,
          key_characteristics: def.key_characteristics,
          usage_notes: def.usage_notes
        });
      });

      // Add trading models
      models.forEach(model => {
        concepts.push({
          id: model.id,
          type: 'trading_model',
          name: model.model_name,
          description: model.description,
          key_characteristics: model.market_conditions,
          trading_rules: model.entry_criteria
        });
      });

      // Add entry techniques
      techniques.forEach(technique => {
        concepts.push({
          id: technique.id,
          type: 'entry_technique',
          name: technique.technique_name,
          description: technique.description,
          key_characteristics: technique.setup_requirements,
          trading_rules: technique.entry_trigger
        });
      });

      // Add patterns
      patterns.forEach(pattern => {
        concepts.push({
          id: pattern.id,
          type: 'pattern',
          name: pattern.pattern_name,
          description: pattern.description,
          key_characteristics: pattern.identification_rules,
          trading_rules: pattern.trading_strategy
        });
      });

      return concepts;
    } catch (error) {
      throw new Error(`Failed to get all concepts for training: ${error}`);
    }
  }

  // Initialize method for compatibility
  async initialize(): Promise<void> {
    // Supabase client is already initialized in constructor
    // This method is kept for compatibility with the original interface
    console.log('Supabase database service initialized');
  }

  // Pattern performance method for knowledge graph
  async getPatternPerformance(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ict_patterns')
      .select(`
        pattern_name,
        pattern_type,
        reliability_score,
        best_timeframes
      `);

    if (error) throw new Error(`Failed to fetch pattern performance: ${error.message}`);
    return data || [];
  }

  // Close connection (for cleanup)
  async close(): Promise<void> {
    // Supabase client doesn't need explicit closing
    // This method is kept for compatibility with the original interface
  }
}