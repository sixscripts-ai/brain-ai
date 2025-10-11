import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { SupabaseDatabaseService } from './supabase-database';
import { 
  TrainingExample, 
  TrainingDataset, 
  ICTDefinition, 
  ICTTradingModel, 
  ICTEntryTechnique, 
  ICTPattern 
} from '../types';

export class TrainingDataGenerator {
  private db: SupabaseDatabaseService;
  private exportPath: string;

  constructor(db: SupabaseDatabaseService, exportPath?: string) {
    this.db = db;
    this.exportPath = exportPath || process.env.TRAINING_DATA_PATH || './exports/training-data';
  }

  async generateAllTrainingData(): Promise<void> {
    console.log('Generating comprehensive AI training datasets...');
    
    // Ensure export directory exists
    await fs.mkdir(this.exportPath, { recursive: true });
    
    // Generate different types of training data
    await this.generateConceptDefinitionDataset();
    await this.generateTradingModelDataset();
    await this.generatePatternRecognitionDataset();
    await this.generateTradingDecisionDataset();
    await this.generateQADataset();
    await this.generateConversationalDataset();
    await this.generateEmbeddingTrainingData();
    await this.generateReasoningDataset();
    
    console.log('All training datasets generated successfully!');
  }

  // Generate concept definition training data
  async generateConceptDefinitionDataset(): Promise<void> {
    const definitions = await this.db.getAllDefinitions();
    const examples: TrainingExample[] = [];
    
    for (const def of definitions) {
      // Basic definition examples
      examples.push({
        id: `def_basic_${def.id}`,
        input: `What is ${def.concept} in ICT trading?`,
        output: def.definition,
        context: 'concept_definition',
        category: 'definitions',
        difficulty: 1,
        metadata: {
          concept_id: def.id,
          concept_name: def.concept,
          type: 'basic_definition'
        }
      });

      // Key characteristics examples
      if (def.key_characteristics) {
        examples.push({
          id: `def_char_${def.id}`,
          input: `What are the key characteristics of ${def.concept}?`,
          output: def.key_characteristics,
          context: 'concept_characteristics',
          category: 'definitions',
          difficulty: 2,
          metadata: {
            concept_id: def.id,
            concept_name: def.concept,
            type: 'characteristics'
          }
        });
      }

      // Related concepts examples
      if (def.related_concepts && def.related_concepts.length > 0) {
        examples.push({
          id: `def_related_${def.id}`,
          input: `What concepts are related to ${def.concept}?`,
          output: def.related_concepts.join(', '),
          context: 'concept_relationships',
          category: 'related_concepts',
          difficulty: 2,
          metadata: {
            concept_id: def.id,
            concept_name: def.concept,
            type: 'related_concepts'
          }
        });
      }

      // Usage notes examples
      if (def.usage_notes) {
        examples.push({
          id: `def_usage_${def.id}`,
          input: `How should I use ${def.concept} in trading?`,
          output: def.usage_notes,
          context: 'practical_application',
          category: 'usage',
          difficulty: 2,
          metadata: {
            concept_id: def.id,
            concept_name: def.concept,
            type: 'usage_notes'
          }
        });
      }

      // Market context examples
      if (def.market_context) {
        examples.push({
          id: `def_context_${def.id}`,
          input: `In what market conditions is ${def.concept} most relevant?`,
          output: def.market_context,
          context: 'market_analysis',
          category: 'context',
          difficulty: 3,
          metadata: {
            concept_id: def.id,
            concept_name: def.concept,
            type: 'market_context'
          }
        });
      }
    }

    const dataset: TrainingDataset = {
      examples,
      metadata: {
        name: 'ICT Concept Definitions',
        version: '1.0.0',
        description: 'Training data for understanding ICT trading concepts and definitions',
        total_examples: examples.length,
        categories: ['definitions', 'trading_rules', 'mistakes', 'confirmations'],
        created_at: new Date().toISOString()
      }
    };

    await this.saveDataset(dataset, 'concept_definitions');
  }

  // Generate trading model training data
  async generateTradingModelDataset(): Promise<void> {
    const models = await this.db.getAllTradingModels();
    const examples: TrainingExample[] = [];
    
    for (const model of models) {
      // Model description
      examples.push({
        id: `model_desc_${model.id}`,
        input: `Explain the ${model.model_name} trading model`,
        output: model.description,
        context: 'trading_model',
        category: 'models',
        difficulty: 2,
        metadata: {
          model_id: model.id,
          model_name: model.model_name,
          success_rate: model.success_rate,
          type: 'model_description'
        }
      });

      // Entry criteria
      examples.push({
        id: `model_entry_${model.id}`,
        input: `What are the entry criteria for ${model.model_name}?`,
        output: model.entry_criteria,
        context: 'trade_entry',
        category: 'entry_criteria',
        difficulty: 3,
        metadata: {
          model_id: model.id,
          model_name: model.model_name,
          type: 'entry_criteria'
        }
      });

      // Exit criteria
      examples.push({
        id: `model_exit_${model.id}`,
        input: `How do you exit trades using ${model.model_name}?`,
        output: model.exit_criteria,
        context: 'trade_exit',
        category: 'exit_criteria',
        difficulty: 3,
        metadata: {
          model_id: model.id,
          model_name: model.model_name,
          type: 'exit_criteria'
        }
      });

      // Market conditions
      examples.push({
        id: `model_conditions_${model.id}`,
        input: `In what market conditions does ${model.model_name} work best?`,
        output: model.market_conditions,
        context: 'market_analysis',
        category: 'market_conditions',
        difficulty: 2,
        metadata: {
          model_id: model.id,
          model_name: model.model_name,
          type: 'market_conditions'
        }
      });

      // Risk management
      examples.push({
        id: `model_risk_${model.id}`,
        input: `What risk management rules apply to ${model.model_name}?`,
        output: model.risk_management,
        context: 'risk_management',
        category: 'risk_management',
        difficulty: 3,
        metadata: {
          model_id: model.id,
          model_name: model.model_name,
          type: 'risk_management'
        }
      });
    }

    const dataset: TrainingDataset = {
      examples,
      metadata: {
        name: 'ICT Trading Models',
        version: '1.0.0',
        description: 'Training data for ICT trading models and strategies',
        total_examples: examples.length,
        categories: ['models', 'entry_criteria', 'exit_criteria', 'market_conditions', 'risk_management'],
        created_at: new Date().toISOString()
      }
    };

    await this.saveDataset(dataset, 'trading_models');
  }

  // Generate pattern recognition training data
  async generatePatternRecognitionDataset(): Promise<void> {
    const patterns = await this.db.getAllPatterns();
    const examples: TrainingExample[] = [];
    
    for (const pattern of patterns) {
      // Pattern identification
      examples.push({
        id: `pattern_id_${pattern.id}`,
        input: `How do you identify ${pattern.pattern_name}?`,
        output: `${pattern.description} Identification rules: ${pattern.identification_rules}`,
        context: 'pattern_recognition',
        category: 'pattern_identification',
        difficulty: 3,
        metadata: {
          pattern_id: pattern.id,
          pattern_name: pattern.pattern_name,
          pattern_type: pattern.pattern_type,
          reliability_score: pattern.reliability_score,
          type: 'pattern_identification'
        }
      });

      // Trading strategy
      examples.push({
        id: `pattern_strategy_${pattern.id}`,
        input: `What's the trading strategy for ${pattern.pattern_name}?`,
        output: pattern.trading_strategy,
        context: 'pattern_trading',
        category: 'pattern_trading',
        difficulty: 3,
        metadata: {
          pattern_id: pattern.id,
          pattern_name: pattern.pattern_name,
          type: 'trading_strategy'
        }
      });

      // Market context
      examples.push({
        id: `pattern_context_${pattern.id}`,
        input: `In what market conditions does ${pattern.pattern_name} work best?`,
        output: pattern.market_context,
        context: 'market_analysis',
        category: 'market_context',
        difficulty: 4,
        metadata: {
          pattern_id: pattern.id,
          pattern_name: pattern.pattern_name,
          type: 'market_context'
        }
      });

      // Best timeframes
      examples.push({
        id: `pattern_timeframes_${pattern.id}`,
        input: `On what timeframes is ${pattern.pattern_name} most effective?`,
        output: pattern.best_timeframes.join(', '),
        context: 'timeframe_analysis',
        category: 'timeframe_analysis',
        difficulty: 2,
        metadata: {
          pattern_id: pattern.id,
          pattern_name: pattern.pattern_name,
          type: 'best_timeframes'
        }
      });
    }

    const dataset: TrainingDataset = {
      examples,
      metadata: {
        name: 'ICT Pattern Recognition',
        version: '1.0.0',
        description: 'Training data for recognizing and trading ICT patterns',
        total_examples: examples.length,
        categories: ['pattern_identification', 'pattern_confirmation', 'pattern_trading', 'timeframe_analysis'],
        created_at: new Date().toISOString()
      }
    };

    await this.saveDataset(dataset, 'pattern_recognition');
  }

  // Generate trading decision training data
  async generateTradingDecisionDataset(): Promise<void> {
    const trades = await this.db.getAllTrades();
    const examples: TrainingExample[] = [];
    
    for (const trade of trades) {
      if (trade.notes && trade.notes.trim()) {
        // Trade analysis
        examples.push({
          id: `trade_analysis_${trade.id}`,
          input: `Analyze this trade: ${trade.symbol} ${trade.direction} at ${trade.entry_price} using ${trade.model_used}`,
          output: `Trade executed using ${trade.model_used} model with ${trade.entry_technique} entry technique. Pattern identified: ${trade.pattern_identified}. Result: ${trade.pnl ? (trade.pnl > 0 ? 'Profitable' : 'Loss') : 'Ongoing'}. Notes: ${trade.notes}`,
          context: 'trade_analysis',
          category: 'trade_analysis',
          difficulty: 4,
          metadata: {
            trade_id: trade.id,
            symbol: trade.symbol,
            direction: trade.direction,
            model_used: trade.model_used,
            pnl: trade.pnl,
            type: 'trade_analysis'
          }
        });

        // Risk-reward analysis
        examples.push({
          id: `risk_reward_${trade.id}`,
          input: `What was the risk-reward ratio for this ${trade.symbol} trade?`,
          output: `Risk-reward ratio: ${trade.risk_reward_ratio}. Entry: ${trade.entry_price}, Stop Loss: ${trade.stop_loss}, Take Profit: ${trade.take_profit}. This represents a ${trade.risk_reward_ratio > 2 ? 'good' : trade.risk_reward_ratio > 1 ? 'acceptable' : 'poor'} risk-reward setup.`,
          context: 'risk_analysis',
          category: 'risk_management',
          difficulty: 3,
          metadata: {
            trade_id: trade.id,
            risk_reward_ratio: trade.risk_reward_ratio,
            type: 'risk_reward_analysis'
          }
        });
      }
    }

    const dataset: TrainingDataset = {
      examples,
      metadata: {
        name: 'ICT Trading Decisions',
        version: '1.0.0',
        description: 'Training data for making trading decisions based on ICT methodology',
        total_examples: examples.length,
        categories: ['trade_analysis', 'risk_management'],
        created_at: new Date().toISOString()
      }
    };

    await this.saveDataset(dataset, 'trading_decisions');
  }

  // Generate Q&A training data
  async generateQADataset(): Promise<void> {
    const examples: TrainingExample[] = [];
    
    // Generate comprehensive Q&A pairs
    const qaTemplates = [
      {
        question: "What is the difference between a Fair Value Gap and an Order Block?",
        answer: "A Fair Value Gap (FVG) is an imbalance in price where there's a gap between the high of one candle and the low of another, indicating inefficient price delivery. An Order Block is a consolidation area where institutional orders are placed, typically the last opposing candle before a strong move. FVGs represent price inefficiencies that need to be filled, while Order Blocks represent areas of institutional interest and potential support/resistance.",
        category: "concept_comparison",
        difficulty: 3
      },
      {
        question: "How do you identify market structure in ICT methodology?",
        answer: "Market structure in ICT is identified by analyzing swing highs and lows. An uptrend (bullish market structure) consists of higher highs and higher lows, while a downtrend (bearish market structure) consists of lower highs and lower lows. Key levels to watch are previous swing highs/lows, equal highs/lows, and areas where structure might shift. A Break of Structure (BOS) occurs when price breaks a significant swing point, while a Shift in Market Structure (SMS) indicates a potential trend change.",
        category: "market_analysis",
        difficulty: 4
      },
      {
        question: "What are the key ICT trading sessions and their characteristics?",
        answer: "ICT recognizes several key trading sessions: 1) London Open (2:00-5:00 AM EST) - High volatility, trend establishment; 2) New York AM Session (8:30-11:30 AM EST) - Institutional order flow, major moves; 3) London Close (10:00 AM-12:00 PM EST) - Profit taking, reversals; 4) New York PM Session (1:30-4:00 PM EST) - Continuation or reversal patterns. Each session has distinct characteristics in terms of volatility, volume, and typical price behavior.",
        category: "time_analysis",
        difficulty: 3
      }
    ];

    qaTemplates.forEach((qa, index) => {
      examples.push({
        id: `qa_${index + 1}`,
        input: qa.question,
        output: qa.answer,
        context: 'educational_qa',
        category: qa.category,
        difficulty: qa.difficulty,
        metadata: {
          type: 'qa_pair',
          topic: qa.category
        }
      });
    });

    const dataset: TrainingDataset = {
      examples,
      metadata: {
        name: 'ICT Q&A Dataset',
        version: '1.0.0',
        description: 'Question and answer pairs for ICT trading education',
        total_examples: examples.length,
        categories: ['concept_comparison', 'market_analysis', 'time_analysis'],
        created_at: new Date().toISOString()
      }
    };

    await this.saveDataset(dataset, 'qa_dataset');
  }

  // Generate conversational training data
  async generateConversationalDataset(): Promise<void> {
    const examples: TrainingExample[] = [];
    
    // Conversational examples for AI interaction
    const conversations = [
      {
        input: "I'm new to ICT. Where should I start?",
        output: "Welcome to ICT! I recommend starting with these fundamental concepts: 1) Market Structure - understanding trends and key levels, 2) Order Blocks - institutional footprints in the market, 3) Fair Value Gaps - price inefficiencies, 4) Liquidity concepts - where orders accumulate. Begin by studying these on higher timeframes (daily/4H) before moving to lower timeframes. Practice identifying these concepts on historical charts before attempting live trading.",
        category: "beginner_guidance",
        difficulty: 1
      },
      {
        input: "How do I know if an Order Block is still valid?",
        output: "An Order Block remains valid as long as: 1) It hasn't been fully mitigated (price hasn't traded through the entire block), 2) The market structure context hasn't changed significantly, 3) It aligns with the current bias and higher timeframe structure. Signs of invalidation include: full mitigation, multiple failed reactions, or a shift in market structure that makes the block irrelevant. Always consider the age of the Order Block - fresher blocks tend to be more reliable.",
        category: "advanced_concepts",
        difficulty: 4
      },
      {
        input: "What's the best timeframe for ICT trading?",
        output: "There's no single 'best' timeframe in ICT - it depends on your trading style and available time. However, ICT methodology emphasizes: 1) Higher timeframes (Daily, 4H) for bias and structure, 2) 1H and 15M for entry refinement, 3) 5M and 1M for precise entries. Many successful ICT traders use a top-down approach: Daily for bias, 4H for structure, 1H for setups, and 15M/5M for entries. The key is maintaining consistency in your timeframe selection.",
        category: "timeframe_analysis",
        difficulty: 2
      }
    ];

    conversations.forEach((conv, index) => {
      examples.push({
        id: `conv_${index + 1}`,
        input: conv.input,
        output: conv.output,
        context: 'conversational_ai',
        category: conv.category,
        difficulty: conv.difficulty,
        metadata: {
          type: 'conversation',
          interaction_style: 'educational'
        }
      });
    });

    const dataset: TrainingDataset = {
      examples,
      metadata: {
        name: 'ICT Conversational Dataset',
        version: '1.0.0',
        description: 'Conversational training data for AI interaction about ICT trading',
        total_examples: examples.length,
        categories: ['beginner_guidance', 'advanced_concepts', 'timeframe_analysis'],
        created_at: new Date().toISOString()
      }
    };

    await this.saveDataset(dataset, 'conversational_dataset');
  }

  // Generate embedding training data
  async generateEmbeddingTrainingData(): Promise<void> {
    const allConcepts = await this.db.getAllConceptsForTraining();
    const embeddingData: any[] = [];
    
    for (const concept of allConcepts) {
      // Create text for embedding
      const text = `${concept.name}: ${concept.description}. Key characteristics: ${concept.key_characteristics || 'N/A'}. Trading rules: ${concept.trading_rules || 'N/A'}.`;
      
      embeddingData.push({
        id: `${concept.type}_${concept.id}`,
        text: text,
        metadata: {
          type: concept.type,
          name: concept.name,
          category: concept.type,
          length: text.length
        }
      });
    }

    // Save as JSON for embedding generation
    const filePath = path.join(this.exportPath, 'embedding_training_data.json');
    await fs.writeFile(filePath, JSON.stringify(embeddingData, null, 2));
    
    console.log(`Embedding training data saved: ${embeddingData.length} items`);
  }

  // Generate reasoning training data
  async generateReasoningDataset(): Promise<void> {
    const examples: TrainingExample[] = [];
    
    // Reasoning examples for decision making
    const reasoningExamples = [
      {
        input: "Price is approaching a daily Order Block, but the 4H structure is bearish. Should I take a long trade?",
        output: "This presents a conflict between timeframes. The reasoning process should be: 1) Higher timeframe bias takes priority - the 4H bearish structure suggests caution for longs, 2) The daily Order Block could provide temporary support but may not hold in a bearish environment, 3) Consider waiting for either: a) 4H structure to shift bullish, or b) a short opportunity if the Order Block fails. Risk management is crucial here - if taking the long, use tight stops and smaller position size due to the conflicting signals.",
        category: "reasoning",
        difficulty: 5
      },
      {
        input: "I see a Fair Value Gap on the 15M chart, but volume is low. How should I approach this?",
        output: "Low volume during FVG formation requires careful analysis: 1) FVGs formed during low volume periods may be less significant and more likely to be ignored by institutional flow, 2) Check if the FVG aligns with higher timeframe structure and key levels, 3) Consider the session timing - FVGs during major sessions (London/NY) carry more weight, 4) If trading the FVG, use smaller position size and be prepared for potential failure. Quality over quantity - wait for high-probability setups with proper volume confirmation.",
        category: "reasoning",
        difficulty: 4
      }
    ];

    reasoningExamples.forEach((example, index) => {
      examples.push({
        id: `reasoning_${index + 1}`,
        input: example.input,
        output: example.output,
        context: 'decision_making',
        category: example.category,
        difficulty: example.difficulty,
        metadata: {
          type: 'reasoning_example',
          complexity: 'multi_factor_analysis'
        }
      });
    });

    const dataset: TrainingDataset = {
      examples,
      metadata: {
        name: 'ICT Reasoning Dataset',
        version: '1.0.0',
        description: 'Training data for logical reasoning and decision making in ICT trading',
        total_examples: examples.length,
        categories: ['reasoning'],
        created_at: new Date().toISOString()
      }
    };

    await this.saveDataset(dataset, 'reasoning_dataset');
  }

  // Save dataset in multiple formats
  private async saveDataset(dataset: TrainingDataset, filename: string): Promise<void> {
    const basePath = path.join(this.exportPath, filename);
    
    // Save as JSON
    await fs.writeFile(`${basePath}.json`, JSON.stringify(dataset, null, 2));
    
    // Save as JSONL (for some AI training frameworks)
    const jsonlContent = dataset.examples.map(example => JSON.stringify(example)).join('\n');
    await fs.writeFile(`${basePath}.jsonl`, jsonlContent);
    
    // Save as CSV
    const csvWriter = createObjectCsvWriter({
      path: `${basePath}.csv`,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'input', title: 'Input' },
        { id: 'output', title: 'Output' },
        { id: 'context', title: 'Context' },
        { id: 'category', title: 'Category' },
        { id: 'difficulty', title: 'Difficulty' },
        { id: 'metadata', title: 'Metadata' }
      ]
    });
    
    const csvData = dataset.examples.map(example => ({
      ...example,
      metadata: JSON.stringify(example.metadata)
    }));
    
    await csvWriter.writeRecords(csvData);
    
    console.log(`Dataset '${dataset.metadata.name}' saved in multiple formats: ${dataset.metadata.total_examples} examples`);
  }

  // Generate summary report
  async generateSummaryReport(): Promise<void> {
    const files = await fs.readdir(this.exportPath);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'summary_report.json');
    
    const summary = {
      generation_date: new Date().toISOString(),
      total_datasets: jsonFiles.length,
      datasets: [] as any[],
      total_examples: 0,
      categories: new Set<string>(),
      difficulty_distribution: {} as Record<number, number>
    };
    
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(this.exportPath, file), 'utf-8');
        const dataset: TrainingDataset = JSON.parse(content);
        
        summary.datasets.push({
          name: dataset.metadata.name,
          filename: file,
          examples: dataset.metadata.total_examples,
          categories: dataset.metadata.categories
        });
        
        summary.total_examples += dataset.metadata.total_examples;
        dataset.metadata.categories.forEach(cat => summary.categories.add(cat));
        
        // Count difficulty distribution
        dataset.examples.forEach(example => {
          summary.difficulty_distribution[example.difficulty] = 
            (summary.difficulty_distribution[example.difficulty] || 0) + 1;
        });
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
    
    const finalSummary = {
      ...summary,
      categories: Array.from(summary.categories)
    };
    
    await fs.writeFile(
      path.join(this.exportPath, 'summary_report.json'),
      JSON.stringify(finalSummary, null, 2)
    );
    
    console.log('Training data generation complete!');
    console.log(`Total datasets: ${summary.total_datasets}`);
    console.log(`Total examples: ${summary.total_examples}`);
    console.log(`Categories: ${Array.from(summary.categories).join(', ')}`);
  }
}