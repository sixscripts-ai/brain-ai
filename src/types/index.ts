// Core ICT Types
export interface ICTDefinition {
  id: number;
  concept: string;
  definition: string;
  key_characteristics: string;
  market_context: string;
  usage_notes: string;
  related_concepts: string[];
  created_at: string;
  updated_at: string;
}

export interface ICTTradingModel {
  id: number;
  model_name: string;
  description: string;
  key_components: string[];
  entry_criteria: string;
  exit_criteria: string;
  risk_management: string;
  success_rate: number;
  difficulty_level: string;
  market_conditions: string;
  timeframes: string[];
  created_at: string;
  updated_at: string;
}

export interface ICTEntryTechnique {
  id: number;
  technique_name: string;
  description: string;
  setup_requirements: string;
  entry_trigger: string;
  stop_loss_placement: string;
  take_profit_strategy: string;
  risk_reward_ratio: number;
  difficulty_level: string;
  best_timeframes: string[];
  market_sessions: string[];
  created_at: string;
  updated_at: string;
}

export interface ICTPattern {
  id: number;
  pattern_name: string;
  pattern_type: string;
  description: string;
  identification_rules: string;
  trading_strategy: string;
  reliability_score: number;
  best_timeframes: string[];
  market_context: string;
  examples: string;
  created_at: string;
  updated_at: string;
}

export interface ICTTimeWindow {
  id: number;
  window_name: string;
  start_time: string;
  end_time: string;
  market_session: string;
  description: string;
  significance: string;
  trading_opportunities: string;
  volatility_level: string;
  created_at: string;
  updated_at: string;
}

export interface ICTTrade {
  id: number;
  trade_date: string;
  symbol: string;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number;
  take_profit: number;
  quantity: number;
  model_used: string;
  entry_technique: string;
  pattern_identified: string;
  time_window: string;
  trade_status: string;
  pnl: number | null;
  risk_reward_ratio: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Knowledge Graph Types
export interface KnowledgeNode {
  id: string;
  type: 'concept' | 'model' | 'technique' | 'pattern' | 'timewindow';
  label: string;
  properties: Record<string, any>;
  embeddings?: number[];
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
  properties?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: {
    version: string;
    created_at: string;
    node_count: number;
    edge_count: number;
  };
}

// AI Training Types
export interface TrainingExample {
  id: string;
  input: string;
  output: string;
  context: string;
  category: string;
  difficulty: number;
  metadata: Record<string, any>;
}

export interface TrainingDataset {
  examples: TrainingExample[];
  metadata: {
    name: string;
    version: string;
    description: string;
    total_examples: number;
    categories: string[];
    created_at: string;
  };
}

// Embedding Types
export interface ConceptEmbedding {
  concept_id: string;
  concept_name: string;
  embedding: number[];
  model_used: string;
  created_at: string;
}

export interface SemanticSearchResult {
  concept: ICTDefinition | ICTTradingModel | ICTEntryTechnique | ICTPattern;
  similarity_score: number;
  relevance_rank: number;
}

// Learning Progression Types
export interface LearningModule {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  concepts: string[];
  difficulty_level: number;
  estimated_duration: number;
  learning_objectives: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: LearningModule[];
  total_duration: number;
  target_audience: string;
}

export interface LearningProgress {
  user_id: string;
  path_id: string;
  current_module: string;
  completed_modules: string[];
  mastery_scores: Record<string, number>;
  last_activity: string;
}

// Reasoning Engine Types
export interface TradingRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  confidence_threshold: number;
}

export interface TradingDecision {
  symbol: string;
  action: 'buy' | 'sell' | 'hold' | 'close';
  confidence: number;
  reasoning: string;
  supporting_concepts: string[];
  risk_assessment: number;
  suggested_entry: number;
  suggested_stop: number;
  suggested_target: number;
}

export interface MarketAnalysis {
  symbol: string;
  timeframe: string;
  analysis_time: string;
  market_structure: string;
  key_levels: number[];
  active_patterns: string[];
  confluence_factors: string[];
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

// API Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface QueryRequest {
  query: string;
  context?: string;
  max_results?: number;
  include_embeddings?: boolean;
  filter_categories?: string[];
}

export interface QueryResponse {
  results: SemanticSearchResult[];
  total_found: number;
  query_time_ms: number;
  suggestions?: string[];
}

// Validation Types
export interface ValidationResult {
  concept_id: string;
  test_name: string;
  passed: boolean;
  score: number;
  details: string;
  timestamp: string;
}

export interface KnowledgeValidation {
  validation_id: string;
  total_tests: number;
  passed_tests: number;
  overall_score: number;
  results: ValidationResult[];
  recommendations: string[];
}

// Configuration Types
export interface SystemConfig {
  database: {
    path: string;
    backup_interval: number;
  };
  ai: {
    openai_api_key: string;
    embedding_model: string;
    embedding_dimensions: number;
  };
  knowledge: {
    update_interval: number;
    validation_frequency: number;
    auto_generate_embeddings: boolean;
  };
  api: {
    port: number;
    rate_limit: {
      window_ms: number;
      max_requests: number;
    };
  };
}

// Event Types for Real-time Updates
export interface KnowledgeUpdateEvent {
  type: 'concept_added' | 'concept_updated' | 'concept_deleted' | 'trade_added' | 'model_updated';
  entity_id: string;
  entity_type: string;
  changes: Record<string, any>;
  timestamp: string;
}

export interface LearningEvent {
  type: 'module_completed' | 'concept_mastered' | 'assessment_taken' | 'progress_updated';
  user_id: string;
  module_id?: string;
  concept_id?: string;
  score?: number;
  timestamp: string;
}