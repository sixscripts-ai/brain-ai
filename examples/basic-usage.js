#!/usr/bin/env node

/**
 * Basic Usage Example for ICT AI Knowledge System
 * 
 * This script demonstrates how to interact with the ICT AI Knowledge System
 * using basic HTTP requests and WebSocket connections.
 */

const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

class ICTKnowledgeClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
    this.ws = null;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      console.log('✅ System Health:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }

  // System status
  async getSystemStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/status`);
      console.log('📊 System Status:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get system status:', error.message);
      throw error;
    }
  }

  // Process AI query
  async processQuery(query, context = {}) {
    try {
      console.log(`🤖 Processing query: "${query}"`);
      
      const response = await axios.post(`${this.baseUrl}/api/ai-query/process`, {
        query,
        context
      });

      const result = response.data.data;
      console.log('📝 Response:', result.response);
      console.log('🔗 Related concepts:', result.related_concepts);
      console.log('💡 Suggested follow-ups:', result.suggested_followups);
      
      return result;
    } catch (error) {
      console.error('❌ Query processing failed:', error.message);
      throw error;
    }
  }

  // Search knowledge graph
  async searchKnowledgeGraph(query, type = null) {
    try {
      console.log(`🔍 Searching knowledge graph: "${query}"`);
      
      const params = { q: query };
      if (type) params.type = type;

      const response = await axios.get(`${this.baseUrl}/api/knowledge-graph/search`, {
        params
      });

      console.log(`📚 Found ${response.data.data.length} results`);
      response.data.data.forEach((node, index) => {
        console.log(`  ${index + 1}. ${node.properties.term || node.properties.name}: ${node.properties.definition || node.properties.description}`);
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Knowledge graph search failed:', error.message);
      throw error;
    }
  }

  // Semantic search using embeddings
  async semanticSearch(query, options = {}) {
    try {
      console.log(`🧠 Semantic search: "${query}"`);
      
      const response = await axios.post(`${this.baseUrl}/api/embeddings/search`, {
        query,
        options: {
          limit: 5,
          threshold: 0.7,
          ...options
        }
      });

      const results = response.data.data.results;
      console.log(`🎯 Found ${results.length} semantically similar results:`);
      
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. (${(result.similarity * 100).toFixed(1)}%) ${result.content.substring(0, 100)}...`);
      });

      return results;
    } catch (error) {
      console.error('❌ Semantic search failed:', error.message);
      throw error;
    }
  }

  // Analyze market using ICT reasoning
  async analyzeMarket(marketData, context = {}) {
    try {
      console.log('📈 Analyzing market conditions...');
      
      const response = await axios.post(`${this.baseUrl}/api/reasoning/analyze-market`, {
        market_data: marketData,
        context
      });

      const analysis = response.data.data.analysis;
      console.log('📊 Market Analysis Results:');
      console.log(`  Market Structure: ${analysis.market_structure}`);
      console.log(`  Institutional Bias: ${analysis.institutional_bias}`);
      console.log(`  Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
      console.log(`  Key Levels:`, analysis.key_levels);

      return response.data.data;
    } catch (error) {
      console.error('❌ Market analysis failed:', error.message);
      throw error;
    }
  }

  // Run knowledge validation
  async runValidation(concepts, difficulty = 'intermediate') {
    try {
      console.log(`🧪 Running validation for concepts: ${concepts.join(', ')}`);
      
      const response = await axios.post(`${this.baseUrl}/api/validation/run-session`, {
        concepts,
        difficulty,
        questions_per_concept: 2
      });

      const results = response.data.data;
      console.log('📋 Validation Results:');
      console.log(`  Overall Score: ${(results.overall_score * 100).toFixed(1)}%`);
      console.log(`  Questions Answered: ${results.total_questions}`);
      
      results.concept_scores.forEach(score => {
        console.log(`  ${score.concept}: ${(score.score * 100).toFixed(1)}%`);
      });

      return results;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  // Generate training data
  async generateTrainingData(types = ['concepts', 'qa'], outputPath = './training_output') {
    try {
      console.log(`🏗️  Generating training data: ${types.join(', ')}`);
      
      const response = await axios.post(`${this.baseUrl}/api/training-data/generate`, {
        types,
        outputPath
      });

      const summary = response.data.summary;
      console.log('📦 Training Data Generated:');
      console.log(`  Total Files: ${summary.total_files}`);
      console.log(`  Total Examples: ${summary.total_examples}`);
      console.log(`  Formats: ${summary.formats.join(', ')}`);
      console.log(`  Size: ${summary.size_mb} MB`);

      return summary;
    } catch (error) {
      console.error('❌ Training data generation failed:', error.message);
      throw error;
    }
  }

  // Connect to WebSocket for real-time updates
  connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to WebSocket...');
        
        this.ws = new WebSocket(WS_URL);

        this.ws.on('open', () => {
          console.log('✅ WebSocket connected');
          
          // Subscribe to updates
          this.ws.send(JSON.stringify({
            event: 'subscribe',
            data: {
              types: ['knowledge-updates', 'training-progress', 'system-status']
            }
          }));

          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            console.log(`📡 WebSocket Event: ${message.event}`, message.data);
          } catch (error) {
            console.log('📡 WebSocket Message:', data.toString());
          }
        });

        this.ws.on('error', (error) => {
          console.error('❌ WebSocket error:', error.message);
          reject(error);
        });

        this.ws.on('close', () => {
          console.log('🔌 WebSocket disconnected');
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Example usage function
async function runExamples() {
  const client = new ICTKnowledgeClient();

  try {
    console.log('🚀 Starting ICT AI Knowledge System Examples\n');

    // 1. Health check
    console.log('1️⃣ Health Check');
    await client.healthCheck();
    console.log('');

    // 2. System status
    console.log('2️⃣ System Status');
    await client.getSystemStatus();
    console.log('');

    // 3. Process AI queries
    console.log('3️⃣ AI Query Processing');
    await client.processQuery(
      "What is an order block and how do I identify it?",
      { user_level: "beginner" }
    );
    console.log('');

    await client.processQuery(
      "How do fair value gaps relate to institutional order flow?",
      { user_level: "intermediate" }
    );
    console.log('');

    // 4. Knowledge graph search
    console.log('4️⃣ Knowledge Graph Search');
    await client.searchKnowledgeGraph("liquidity", "definition");
    console.log('');

    // 5. Semantic search
    console.log('5️⃣ Semantic Search');
    await client.semanticSearch("institutional trading patterns");
    console.log('');

    // 6. Market analysis
    console.log('6️⃣ Market Analysis');
    await client.analyzeMarket({
      symbol: "EURUSD",
      timeframe: "1H",
      current_price: 1.0850,
      recent_highs: [1.0875, 1.0890],
      recent_lows: [1.0820, 1.0835]
    }, {
      session: "london",
      news_events: ["ECB_MEETING"]
    });
    console.log('');

    // 7. Knowledge validation
    console.log('7️⃣ Knowledge Validation');
    await client.runValidation(["order_blocks", "liquidity"], "intermediate");
    console.log('');

    // 8. WebSocket connection (run for 10 seconds)
    console.log('8️⃣ WebSocket Real-time Updates');
    await client.connectWebSocket();
    
    // Keep connection open for 10 seconds to see real-time updates
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    client.disconnectWebSocket();
    console.log('');

    // 9. Generate training data (commented out as it takes time)
    console.log('9️⃣ Training Data Generation (skipped - uncomment to run)');
    // await client.generateTrainingData(['concepts', 'qa'], './examples/training_output');
    console.log('');

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Example execution failed:', error.message);
  } finally {
    client.disconnectWebSocket();
  }
}

// Batch processing example
async function batchProcessingExample() {
  const client = new ICTKnowledgeClient();

  console.log('🔄 Batch Processing Example\n');

  try {
    // Batch query processing
    const queries = [
      { id: "q1", query: "What is liquidity?", context: { user_level: "beginner" } },
      { id: "q2", query: "How do I identify market structure?", context: { user_level: "intermediate" } },
      { id: "q3", query: "What are order blocks?", context: { user_level: "beginner" } }
    ];

    console.log('📝 Processing batch queries...');
    const response = await axios.post(`${client.baseUrl}/api/ai-query/batch`, { queries });
    
    response.data.data.results.forEach(result => {
      console.log(`Query ${result.id}: ${result.response.substring(0, 100)}...`);
    });

    // Batch semantic search
    const searchQueries = [
      "institutional order flow",
      "market structure analysis", 
      "liquidity patterns"
    ];

    console.log('\n🔍 Batch semantic search...');
    const batchSearchResponse = await axios.post(`${client.baseUrl}/api/embeddings/batch-search`, {
      queries: searchQueries.map((query, index) => ({
        id: `search_${index}`,
        query,
        options: { limit: 3, threshold: 0.7 }
      }))
    });

    batchSearchResponse.data.data.results.forEach(result => {
      console.log(`Search ${result.id}: ${result.results.length} results found`);
    });

  } catch (error) {
    console.error('❌ Batch processing failed:', error.message);
  }
}

// Advanced features example
async function advancedFeaturesExample() {
  const client = new ICTKnowledgeClient();

  console.log('🚀 Advanced Features Example\n');

  try {
    // 1. Complete ICT analysis workflow
    console.log('1️⃣ Complete ICT Analysis Workflow');
    
    const marketData = {
      symbol: "GBPUSD",
      timeframe: "4H",
      current_price: 1.2650,
      recent_highs: [1.2680, 1.2695],
      recent_lows: [1.2620, 1.2635],
      volume_profile: [
        { price: 1.2650, volume: 1500 },
        { price: 1.2660, volume: 2200 }
      ]
    };

    // Analyze market
    const analysis = await client.analyzeMarket(marketData, {
      session: "new_york",
      news_events: ["BOE_RATE_DECISION"]
    });

    // Generate trading decision
    console.log('💡 Generating trading decision...');
    const decisionResponse = await axios.post(`${client.baseUrl}/api/reasoning/generate-decision`, {
      analysis_id: "analysis_12345",
      risk_tolerance: "moderate",
      account_size: 10000,
      max_risk_percent: 2
    });

    console.log('📊 Trading Decision:', decisionResponse.data.data);

    // 2. Knowledge validation with custom questions
    console.log('\n2️⃣ Custom Knowledge Validation');
    
    const questionsResponse = await axios.post(`${client.baseUrl}/api/validation/generate-questions`, {
      concept: "fair_value_gaps",
      difficulty: "advanced",
      count: 3,
      question_types: ["scenario", "multiple_choice"]
    });

    console.log('❓ Generated Questions:', questionsResponse.data.data.questions.length);

    // 3. Real-time knowledge updates monitoring
    console.log('\n3️⃣ Knowledge Updates Monitoring');
    
    const updatesResponse = await axios.get(`${client.baseUrl}/api/knowledge-updates/recent?limit=10`);
    console.log('📈 Recent Updates:', updatesResponse.data.updates.length);

    // 4. Performance analytics
    console.log('\n4️⃣ Performance Analytics');
    
    const analyticsResponse = await axios.get(`${client.baseUrl}/api/ai-query/analytics?period=day`);
    console.log('📊 Query Analytics:', analyticsResponse.data.data);

    const reasoningPerformance = await axios.get(`${client.baseUrl}/api/reasoning/performance`);
    console.log('🎯 Reasoning Performance:', reasoningPerformance.data.data);

  } catch (error) {
    console.error('❌ Advanced features example failed:', error.message);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--batch')) {
    batchProcessingExample();
  } else if (args.includes('--advanced')) {
    advancedFeaturesExample();
  } else {
    runExamples();
  }
}

module.exports = ICTKnowledgeClient;