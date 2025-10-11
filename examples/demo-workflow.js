#!/usr/bin/env node

/**
 * Demo Workflow for ICT AI Knowledge System
 * 
 * This script demonstrates a complete workflow of training an AI model
 * on ICT concepts and validating its understanding.
 */

const axios = require('axios');
const WebSocket = require('ws');
const fs = require('fs').promises;

const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

class ICTTrainingWorkflow {
  constructor() {
    this.sessionId = `demo_${Date.now()}`;
    this.ws = null;
    this.progress = {
      step: 0,
      totalSteps: 8,
      currentTask: ''
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icons = { info: '📝', success: '✅', error: '❌', warning: '⚠️', progress: '⏳' };
    console.log(`[${timestamp}] ${icons[type]} ${message}`);
  }

  updateProgress(step, task) {
    this.progress.step = step;
    this.progress.currentTask = task;
    const percentage = ((step / this.progress.totalSteps) * 100).toFixed(1);
    this.log(`Step ${step}/${this.progress.totalSteps} (${percentage}%): ${task}`, 'progress');
  }

  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(WS_URL);
      
      this.ws.on('open', () => {
        this.log('Connected to real-time monitoring', 'success');
        
        // Subscribe to all events
        this.ws.send(JSON.stringify({
          event: 'subscribe',
          data: {
            types: ['training-progress', 'validation-results', 'knowledge-updates', 'system-status']
          }
        }));
        
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          this.log(`WebSocket message: ${data.toString().substring(0, 100)}...`);
        }
      });

      this.ws.on('error', (error) => {
        this.log(`WebSocket error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  handleWebSocketMessage(message) {
    const { event, data } = message;
    
    switch (event) {
      case 'training-progress':
        this.log(`Training progress: ${(data.progress * 100).toFixed(1)}%`);
        break;
      case 'validation-results':
        this.log(`Validation completed: ${(data.accuracy * 100).toFixed(1)}% accuracy`);
        break;
      case 'knowledge-updates':
        this.log(`Knowledge updated: ${data.concepts_added || 0} new concepts`);
        break;
      case 'system-status':
        if (data.status !== 'healthy') {
          this.log(`System status: ${data.status}`, 'warning');
        }
        break;
    }
  }

  async step1_SystemCheck() {
    this.updateProgress(1, 'Checking system health and connectivity');
    
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      this.log(`System status: ${response.data.status}`, 'success');
      
      const statusResponse = await axios.get(`${BASE_URL}/api/status`);
      const status = statusResponse.data;
      
      this.log(`Database: ${status.database?.connected ? 'Connected' : 'Disconnected'}`);
      this.log(`Knowledge Graph: ${status.knowledge_graph?.nodes || 0} nodes`);
      this.log(`Vector Store: ${status.vector_store?.embeddings || 0} embeddings`);
      
      return status;
    } catch (error) {
      this.log(`System check failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async step2_ExploreKnowledge() {
    this.updateProgress(2, 'Exploring existing knowledge base');
    
    try {
      // Get knowledge graph statistics
      const statsResponse = await axios.get(`${BASE_URL}/api/knowledge-graph/stats`);
      const stats = statsResponse.data.data;
      
      this.log(`Knowledge Graph Statistics:`, 'info');
      this.log(`  Concepts: ${stats.concepts || 0}`);
      this.log(`  Definitions: ${stats.definitions || 0}`);
      this.log(`  Examples: ${stats.examples || 0}`);
      this.log(`  Relationships: ${stats.relationships || 0}`);
      
      // Search for key ICT concepts
      const keyTerms = ['liquidity', 'order block', 'fair value gap', 'market structure'];
      
      for (const term of keyTerms) {
        const searchResponse = await axios.get(`${BASE_URL}/api/knowledge-graph/search`, {
          params: { q: term, limit: 1 }
        });
        
        const results = searchResponse.data.data;
        if (results.length > 0) {
          this.log(`  ✓ Found: ${term}`);
        } else {
          this.log(`  ✗ Missing: ${term}`, 'warning');
        }
      }
      
      return stats;
    } catch (error) {
      this.log(`Knowledge exploration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async step3_TestAIQuery() {
    this.updateProgress(3, 'Testing AI query processing capabilities');
    
    const testQueries = [
      {
        query: "What is liquidity in ICT trading?",
        context: { user_level: "beginner", session_id: this.sessionId }
      },
      {
        query: "How do I identify institutional order blocks?",
        context: { user_level: "intermediate", session_id: this.sessionId }
      },
      {
        query: "Explain the relationship between fair value gaps and market structure",
        context: { user_level: "advanced", session_id: this.sessionId }
      }
    ];

    const results = [];

    for (const [index, testQuery] of testQueries.entries()) {
      try {
        this.log(`Processing query ${index + 1}: "${testQuery.query.substring(0, 50)}..."`);
        
        const response = await axios.post(`${BASE_URL}/api/ai-query/process`, testQuery);
        const result = response.data.data;
        
        this.log(`  Response length: ${result.response.length} characters`);
        this.log(`  Related concepts: ${result.related_concepts.length}`);
        this.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        
        results.push({
          query: testQuery.query,
          response_length: result.response.length,
          confidence: result.confidence,
          related_concepts: result.related_concepts.length
        });
        
      } catch (error) {
        this.log(`Query ${index + 1} failed: ${error.message}`, 'error');
      }
    }

    return results;
  }

  async step4_SemanticSearch() {
    this.updateProgress(4, 'Testing semantic search and embeddings');
    
    try {
      const searchQueries = [
        "institutional trading patterns",
        "market manipulation techniques", 
        "price action analysis methods"
      ];

      const searchResults = [];

      for (const query of searchQueries) {
        this.log(`Semantic search: "${query}"`);
        
        const response = await axios.post(`${BASE_URL}/api/embeddings/search`, {
          query,
          options: { limit: 3, threshold: 0.7 }
        });

        const results = response.data.data.results;
        this.log(`  Found ${results.length} semantically similar results`);
        
        if (results.length > 0) {
          const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
          this.log(`  Average similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
        }

        searchResults.push({
          query,
          results_count: results.length,
          avg_similarity: results.length > 0 ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0
        });
      }

      return searchResults;
    } catch (error) {
      this.log(`Semantic search failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async step5_MarketAnalysis() {
    this.updateProgress(5, 'Testing ICT reasoning engine with market analysis');
    
    try {
      const marketScenarios = [
        {
          name: "London Session Opening",
          data: {
            symbol: "GBPUSD",
            timeframe: "15M",
            current_price: 1.2650,
            recent_highs: [1.2680, 1.2695],
            recent_lows: [1.2620, 1.2635],
            session: "london_open"
          }
        },
        {
          name: "New York Kill Zone",
          data: {
            symbol: "EURUSD", 
            timeframe: "5M",
            current_price: 1.0850,
            recent_highs: [1.0875, 1.0890],
            recent_lows: [1.0820, 1.0835],
            session: "new_york_killzone"
          }
        }
      ];

      const analysisResults = [];

      for (const scenario of marketScenarios) {
        this.log(`Analyzing: ${scenario.name}`);
        
        const response = await axios.post(`${BASE_URL}/api/reasoning/analyze-market`, {
          market_data: scenario.data,
          context: { demo_session: this.sessionId }
        });

        const analysis = response.data.data.analysis;
        
        this.log(`  Market Structure: ${analysis.market_structure}`);
        this.log(`  Institutional Bias: ${analysis.institutional_bias}`);
        this.log(`  Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
        
        analysisResults.push({
          scenario: scenario.name,
          market_structure: analysis.market_structure,
          bias: analysis.institutional_bias,
          confidence: analysis.confidence
        });
      }

      return analysisResults;
    } catch (error) {
      this.log(`Market analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async step6_KnowledgeValidation() {
    this.updateProgress(6, 'Running knowledge validation tests');
    
    try {
      const concepts = ['liquidity', 'order_blocks', 'market_structure'];
      
      this.log(`Running validation for concepts: ${concepts.join(', ')}`);
      
      const response = await axios.post(`${BASE_URL}/api/validation/run-session`, {
        concepts,
        difficulty: 'intermediate',
        questions_per_concept: 2,
        session_id: this.sessionId
      });

      const results = response.data.data;
      
      this.log(`Validation Results:`, 'success');
      this.log(`  Overall Score: ${(results.overall_score * 100).toFixed(1)}%`);
      this.log(`  Total Questions: ${results.total_questions}`);
      
      results.concept_scores.forEach(score => {
        this.log(`  ${score.concept}: ${(score.score * 100).toFixed(1)}%`);
      });

      return results;
    } catch (error) {
      this.log(`Knowledge validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async step7_GenerateTrainingData() {
    this.updateProgress(7, 'Generating training data for AI models');
    
    try {
      this.log('Generating comprehensive training dataset...');
      
      const response = await axios.post(`${BASE_URL}/api/training-data/generate`, {
        types: ['concepts', 'qa', 'conversations'],
        outputPath: `./demo_training_${this.sessionId}`,
        formats: ['json', 'jsonl'],
        quality_filter: 'high'
      });

      const summary = response.data.summary;
      
      this.log(`Training Data Generated:`, 'success');
      this.log(`  Total Files: ${summary.total_files}`);
      this.log(`  Total Examples: ${summary.total_examples}`);
      this.log(`  Size: ${summary.size_mb} MB`);
      this.log(`  Formats: ${summary.formats.join(', ')}`);

      return summary;
    } catch (error) {
      this.log(`Training data generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async step8_SystemPerformance() {
    this.updateProgress(8, 'Analyzing system performance and generating report');
    
    try {
      // Get performance analytics
      const analyticsResponse = await axios.get(`${BASE_URL}/api/ai-query/analytics?period=hour`);
      const analytics = analyticsResponse.data.data;
      
      this.log(`Performance Analytics:`, 'info');
      this.log(`  Total Queries: ${analytics.total_queries || 0}`);
      this.log(`  Average Response Time: ${analytics.avg_response_time || 0}ms`);
      this.log(`  Success Rate: ${((analytics.success_rate || 0) * 100).toFixed(1)}%`);
      
      // Get reasoning performance
      const reasoningResponse = await axios.get(`${BASE_URL}/api/reasoning/performance`);
      const reasoning = reasoningResponse.data.data;
      
      this.log(`Reasoning Engine Performance:`);
      this.log(`  Analyses Completed: ${reasoning.total_analyses || 0}`);
      this.log(`  Average Confidence: ${((reasoning.avg_confidence || 0) * 100).toFixed(1)}%`);
      
      return { analytics, reasoning };
    } catch (error) {
      this.log(`Performance analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateReport(workflowResults) {
    this.log('Generating comprehensive workflow report...', 'info');
    
    const report = {
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      workflow_results: workflowResults,
      summary: {
        total_steps: this.progress.totalSteps,
        completed_steps: this.progress.step,
        success_rate: (this.progress.step / this.progress.totalSteps * 100).toFixed(1) + '%'
      },
      recommendations: []
    };

    // Add recommendations based on results
    if (workflowResults.knowledge_validation?.overall_score < 0.8) {
      report.recommendations.push("Consider expanding the knowledge base with more detailed ICT concepts");
    }
    
    if (workflowResults.semantic_search?.some(r => r.avg_similarity < 0.7)) {
      report.recommendations.push("Improve embedding quality for better semantic search results");
    }
    
    if (workflowResults.ai_queries?.some(r => r.confidence < 0.8)) {
      report.recommendations.push("Enhance AI query processing with more training data");
    }

    // Save report
    const reportPath = `./demo_report_${this.sessionId}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Report saved to: ${reportPath}`, 'success');
    return report;
  }

  async runCompleteWorkflow() {
    this.log(`Starting ICT AI Knowledge System Demo Workflow`, 'info');
    this.log(`Session ID: ${this.sessionId}`, 'info');
    
    const workflowResults = {};
    
    try {
      // Connect to WebSocket for real-time monitoring
      await this.connectWebSocket();
      
      // Run all workflow steps
      workflowResults.system_check = await this.step1_SystemCheck();
      workflowResults.knowledge_exploration = await this.step2_ExploreKnowledge();
      workflowResults.ai_queries = await this.step3_TestAIQuery();
      workflowResults.semantic_search = await this.step4_SemanticSearch();
      workflowResults.market_analysis = await this.step5_MarketAnalysis();
      workflowResults.knowledge_validation = await this.step6_KnowledgeValidation();
      workflowResults.training_data = await this.step7_GenerateTrainingData();
      workflowResults.performance = await this.step8_SystemPerformance();
      
      // Generate comprehensive report
      const report = await this.generateReport(workflowResults);
      
      this.log('🎉 Demo workflow completed successfully!', 'success');
      this.log(`📊 Overall Success Rate: ${report.summary.success_rate}`, 'success');
      
      if (report.recommendations.length > 0) {
        this.log('💡 Recommendations:', 'info');
        report.recommendations.forEach(rec => this.log(`  • ${rec}`, 'info'));
      }
      
      return report;
      
    } catch (error) {
      this.log(`Workflow failed at step ${this.progress.step}: ${error.message}`, 'error');
      throw error;
    } finally {
      if (this.ws) {
        this.ws.close();
      }
    }
  }
}

// Quick demo function
async function quickDemo() {
  console.log('⚡ Quick Demo - Testing Core Functionality\n');
  
  try {
    // Health check
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ System Health:', healthResponse.data.status);
    
    // Simple query
    const queryResponse = await axios.post(`${BASE_URL}/api/ai-query/process`, {
      query: "What is ICT trading?",
      context: { demo: true }
    });
    console.log('✅ AI Query Response:', queryResponse.data.data.response.substring(0, 100) + '...');
    
    // Knowledge search
    const searchResponse = await axios.get(`${BASE_URL}/api/knowledge-graph/search?q=liquidity&limit=1`);
    console.log('✅ Knowledge Search:', searchResponse.data.data.length, 'results found');
    
    console.log('\n🎉 Quick demo completed successfully!');
    
  } catch (error) {
    console.log('❌ Quick demo failed:', error.message);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    quickDemo();
  } else {
    const workflow = new ICTTrainingWorkflow();
    workflow.runCompleteWorkflow()
      .then(report => {
        console.log('\n📋 Workflow Summary:');
        console.log(`Session: ${report.session_id}`);
        console.log(`Success Rate: ${report.summary.success_rate}`);
        console.log(`Report: demo_report_${report.session_id}.json`);
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Workflow failed:', error.message);
        process.exit(1);
      });
  }
}

module.exports = ICTTrainingWorkflow;