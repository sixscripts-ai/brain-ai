import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { 
  ICTDefinition, 
  ICTTradingModel, 
  ICTEntryTechnique, 
  ICTPattern, 
  ICTTimeWindow, 
  ICTTrade 
} from '../types';

export class DatabaseService {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || process.env.DATABASE_PATH || './ict_trading_db.sqlite';
    this.db = new sqlite3.Database(this.dbPath);
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Enable foreign keys
        this.db.run("PRAGMA foreign_keys = ON");
        resolve();
      });
    });
  }

  // Generic query methods
  private async runQuery(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  private async getQuery<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  private async allQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  // ICT Definitions
  async getAllDefinitions(): Promise<ICTDefinition[]> {
    return this.allQuery<ICTDefinition>('SELECT * FROM ict_definitions ORDER BY concept');
  }

  async getDefinitionById(id: number): Promise<ICTDefinition | undefined> {
    return this.getQuery<ICTDefinition>('SELECT * FROM ict_definitions WHERE id = ?', [id]);
  }

  async getDefinitionByConcept(concept: string): Promise<ICTDefinition | undefined> {
    return this.getQuery<ICTDefinition>('SELECT * FROM ict_definitions WHERE concept = ?', [concept]);
  }

  async searchDefinitions(searchTerm: string): Promise<ICTDefinition[]> {
    const sql = `
      SELECT * FROM ict_definitions 
      WHERE concept LIKE ? OR definition LIKE ? OR key_characteristics LIKE ?
      ORDER BY concept
    `;
    const term = `%${searchTerm}%`;
    return this.allQuery<ICTDefinition>(sql, [term, term, term]);
  }

  // ICT Trading Models
  async getAllTradingModels(): Promise<ICTTradingModel[]> {
    return this.allQuery<ICTTradingModel>('SELECT * FROM ict_trading_models ORDER BY model_name');
  }

  async getTradingModelById(id: number): Promise<ICTTradingModel | undefined> {
    return this.getQuery<ICTTradingModel>('SELECT * FROM ict_trading_models WHERE id = ?', [id]);
  }

  async getTradingModelsBySuccessRate(minRate: number): Promise<ICTTradingModel[]> {
    return this.allQuery<ICTTradingModel>(
      'SELECT * FROM ict_trading_models WHERE success_rate >= ? ORDER BY success_rate DESC',
      [minRate]
    );
  }

  // ICT Entry Techniques
  async getAllEntryTechniques(): Promise<ICTEntryTechnique[]> {
    return this.allQuery<ICTEntryTechnique>('SELECT * FROM ict_entry_techniques ORDER BY technique_name');
  }

  async getEntryTechniqueById(id: number): Promise<ICTEntryTechnique | undefined> {
    return this.getQuery<ICTEntryTechnique>('SELECT * FROM ict_entry_techniques WHERE id = ?', [id]);
  }

  async getEntryTechniquesByDifficulty(difficulty: string): Promise<ICTEntryTechnique[]> {
    return this.allQuery<ICTEntryTechnique>(
      'SELECT * FROM ict_entry_techniques WHERE difficulty_level = ? ORDER BY technique_name',
      [difficulty]
    );
  }

  // ICT Patterns
  async getAllPatterns(): Promise<ICTPattern[]> {
    return this.allQuery<ICTPattern>('SELECT * FROM ict_patterns ORDER BY pattern_name');
  }

  async getPatternById(id: number): Promise<ICTPattern | undefined> {
    return this.getQuery<ICTPattern>('SELECT * FROM ict_patterns WHERE id = ?', [id]);
  }

  async getPatternsByType(patternType: string): Promise<ICTPattern[]> {
    return this.allQuery<ICTPattern>(
      'SELECT * FROM ict_patterns WHERE pattern_type = ? ORDER BY reliability_score DESC',
      [patternType]
    );
  }

  async getPatternsByReliability(minScore: number): Promise<ICTPattern[]> {
    return this.allQuery<ICTPattern>(
      'SELECT * FROM ict_patterns WHERE reliability_score >= ? ORDER BY reliability_score DESC',
      [minScore]
    );
  }

  // ICT Time Windows
  async getAllTimeWindows(): Promise<ICTTimeWindow[]> {
    return this.allQuery<ICTTimeWindow>('SELECT * FROM ict_time_windows ORDER BY start_time');
  }

  async getTimeWindowById(id: number): Promise<ICTTimeWindow | undefined> {
    return this.getQuery<ICTTimeWindow>('SELECT * FROM ict_time_windows WHERE id = ?', [id]);
  }

  async getTimeWindowsBySession(session: string): Promise<ICTTimeWindow[]> {
    return this.allQuery<ICTTimeWindow>(
      'SELECT * FROM ict_time_windows WHERE market_session = ? ORDER BY start_time',
      [session]
    );
  }

  // ICT Trades
  async getAllTrades(): Promise<ICTTrade[]> {
    return this.allQuery<ICTTrade>('SELECT * FROM ict_trades ORDER BY trade_date DESC');
  }

  async getTradeById(id: number): Promise<ICTTrade | undefined> {
    return this.getQuery<ICTTrade>('SELECT * FROM ict_trades WHERE id = ?', [id]);
  }

  async getTradesBySymbol(symbol: string): Promise<ICTTrade[]> {
    return this.allQuery<ICTTrade>(
      'SELECT * FROM ict_trades WHERE symbol = ? ORDER BY trade_date DESC',
      [symbol]
    );
  }

  async getTradesByModel(model: string): Promise<ICTTrade[]> {
    return this.allQuery<ICTTrade>(
      'SELECT * FROM ict_trades WHERE model_used = ? ORDER BY trade_date DESC',
      [model]
    );
  }

  async getTradesByDateRange(startDate: string, endDate: string): Promise<ICTTrade[]> {
    return this.allQuery<ICTTrade>(
      'SELECT * FROM ict_trades WHERE trade_date BETWEEN ? AND ? ORDER BY trade_date DESC',
      [startDate, endDate]
    );
  }

  async getProfitableTrades(): Promise<ICTTrade[]> {
    return this.allQuery<ICTTrade>(
      'SELECT * FROM ict_trades WHERE pnl > 0 ORDER BY pnl DESC'
    );
  }

  // Analytics and Statistics
  async getTradeStatistics(): Promise<any> {
    const sql = `
      SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
        COUNT(CASE WHEN pnl < 0 THEN 1 END) as losing_trades,
        AVG(pnl) as avg_pnl,
        SUM(pnl) as total_pnl,
        AVG(risk_reward_ratio) as avg_risk_reward,
        MAX(pnl) as best_trade,
        MIN(pnl) as worst_trade
      FROM ict_trades 
      WHERE trade_status = 'closed'
    `;
    return this.getQuery(sql);
  }

  async getModelPerformance(): Promise<any[]> {
    const sql = `
      SELECT 
        model_used,
        COUNT(*) as total_trades,
        COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
        AVG(pnl) as avg_pnl,
        SUM(pnl) as total_pnl,
        AVG(risk_reward_ratio) as avg_risk_reward
      FROM ict_trades 
      WHERE trade_status = 'closed'
      GROUP BY model_used
      ORDER BY avg_pnl DESC
    `;
    return this.allQuery(sql);
  }

  async getPatternPerformance(): Promise<any[]> {
    const sql = `
      SELECT 
        pattern_identified,
        COUNT(*) as total_trades,
        COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
        AVG(pnl) as avg_pnl,
        SUM(pnl) as total_pnl
      FROM ict_trades 
      WHERE trade_status = 'closed' AND pattern_identified IS NOT NULL
      GROUP BY pattern_identified
      ORDER BY avg_pnl DESC
    `;
    return this.allQuery(sql);
  }

  // Knowledge Graph Data
  async getRelatedConcepts(conceptId: number): Promise<any[]> {
    const sql = `
      SELECT DISTINCT 
        d2.id,
        d2.concept,
        d2.definition,
        'related_concept' as relationship_type
      FROM ict_definitions d1
      JOIN ict_definitions d2 ON d1.related_concepts LIKE '%' || d2.concept || '%'
      WHERE d1.id = ? AND d2.id != ?
    `;
    return this.allQuery(sql, [conceptId, conceptId]);
  }

  async getConceptUsageInTrades(concept: string): Promise<any[]> {
    const sql = `
      SELECT 
        symbol,
        trade_date,
        direction,
        pnl,
        model_used,
        entry_technique,
        pattern_identified
      FROM ict_trades
      WHERE model_used LIKE ? OR entry_technique LIKE ? OR pattern_identified LIKE ?
      ORDER BY trade_date DESC
    `;
    const term = `%${concept}%`;
    return this.allQuery(sql, [term, term, term]);
  }

  // Bulk operations for AI training data
  async getAllConceptsForTraining(): Promise<any[]> {
    const sql = `
      SELECT 
        'definition' as type,
        id,
        concept as name,
        definition as description,
        key_characteristics,
        typical_confirmations,
        trading_rules,
        common_mistakes,
        related_concepts
      FROM ict_definitions
      UNION ALL
      SELECT 
        'model' as type,
        id,
        model_name as name,
        description,
        market_conditions as key_characteristics,
        entry_criteria as typical_confirmations,
        exit_criteria as trading_rules,
        risk_management as common_mistakes,
        NULL as related_concepts
      FROM ict_trading_models
      UNION ALL
      SELECT 
        'technique' as type,
        id,
        technique_name as name,
        description,
        setup_requirements as key_characteristics,
        entry_trigger as typical_confirmations,
        stop_loss_placement as trading_rules,
        take_profit_targets as common_mistakes,
        timeframe_suitability as related_concepts
      FROM ict_entry_techniques
      UNION ALL
      SELECT 
        'pattern' as type,
        id,
        pattern_name as name,
        description,
        formation_rules as key_characteristics,
        confirmation_signals as typical_confirmations,
        trading_implications as trading_rules,
        timeframe_relevance as common_mistakes,
        NULL as related_concepts
      FROM ict_patterns
    `;
    return this.allQuery(sql);
  }

  // Close database connection
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getQuery('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}