# ICT AI Knowledge System - Examples

This directory contains comprehensive examples and scripts for integrating with the ICT AI Knowledge System. These examples demonstrate how to use the system for AI training, knowledge validation, and real-time monitoring.

## 📁 Files Overview

### Core Examples
- **`basic-usage.js`** - Basic HTTP and WebSocket integration examples
- **`ai-integration.py`** - Advanced AI/LLM integration for training and fine-tuning
- **`test-connection.js`** - Connection testing and system health verification
- **`demo-workflow.js`** - Complete workflow demonstration

### Configuration
- **`package.json`** - Node.js dependencies for JavaScript examples
- **`requirements.txt`** - Python dependencies for AI integration examples

## 🚀 Quick Start

### 1. Install Dependencies

For JavaScript examples:
```bash
cd examples
npm install
```

For Python examples:
```bash
pip install -r requirements.txt
```

### 2. Test Connection

Before running examples, verify the system is running:

```bash
# Quick connection test
node test-connection.js --quick

# Full connection test
node test-connection.js
```

### 3. Run Basic Examples

```bash
# Basic usage examples
npm run basic

# Batch processing examples
npm run batch

# Advanced features
npm run advanced
```

## 📚 Example Scripts

### Basic Usage (`basic-usage.js`)

Demonstrates fundamental system interactions:

```javascript
const ICTKnowledgeClient = require('./basic-usage');
const client = new ICTKnowledgeClient();

// Process AI queries
await client.processQuery("What is an order block?");

// Search knowledge graph
await client.searchKnowledgeGraph("liquidity");

// Semantic search
await client.semanticSearch("institutional trading patterns");

// Market analysis
await client.analyzeMarket(marketData);

// Real-time WebSocket connection
await client.connectWebSocket();
```

**Key Features:**
- ✅ Health checks and system status
- 🤖 AI query processing
- 🔍 Knowledge graph search
- 🧠 Semantic search with embeddings
- 📈 ICT market analysis
- 🧪 Knowledge validation
- 📦 Training data generation
- 🔌 Real-time WebSocket updates

### AI Integration (`ai-integration.py`)

Advanced integration for AI/LLM training:

```python
from ai_integration import ICTKnowledgeIntegrator

integrator = ICTKnowledgeIntegrator()

# Prepare training data for different AI frameworks
openai_data = integrator.prepare_openai_training_data()
hf_dataset = integrator.prepare_huggingface_dataset()

# Create RAG knowledge base
knowledge_base = integrator.create_rag_knowledge_base()

# Validate AI model performance
results = integrator.validate_ai_understanding(model_responses)
```

**Supported AI Frameworks:**
- 🤖 **OpenAI** - Fine-tuning format preparation
- 🤗 **HuggingFace** - Dataset creation for transformers
- 🔍 **RAG Systems** - Knowledge base for retrieval-augmented generation
- 📊 **Custom Models** - Embeddings and validation tools

### Demo Workflow (`demo-workflow.js`)

Complete system demonstration:

```bash
# Run full demo workflow
node demo-workflow.js

# Quick functionality test
node demo-workflow.js --quick
```

**Workflow Steps:**
1. 🔧 System health check
2. 📚 Knowledge base exploration
3. 🤖 AI query testing
4. 🔍 Semantic search validation
5. 📈 Market analysis demonstration
6. 🧪 Knowledge validation testing
7. 📦 Training data generation
8. 📊 Performance analysis and reporting

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the examples directory:

```env
# System Configuration
ICT_API_BASE_URL=http://localhost:3000
ICT_WS_URL=ws://localhost:3000

# AI Service Keys (for advanced examples)
OPENAI_API_KEY=your_openai_key_here
HUGGINGFACE_API_KEY=your_hf_key_here

# Optional: Custom settings
LOG_LEVEL=info
TIMEOUT_MS=10000
```

### System Requirements

- **Node.js** 18+ (for JavaScript examples)
- **Python** 3.8+ (for AI integration examples)
- **ICT AI Knowledge System** running on localhost:3000

## 📖 Usage Examples

### 1. Basic Query Processing

```javascript
const client = new ICTKnowledgeClient();

// Simple query
const response = await client.processQuery(
  "What is liquidity in ICT trading?",
  { user_level: "beginner" }
);

console.log(response.response);
console.log("Related concepts:", response.related_concepts);
```

### 2. Batch Processing

```javascript
// Process multiple queries
const queries = [
  { id: "q1", query: "What is an order block?" },
  { id: "q2", query: "How do fair value gaps work?" },
  { id: "q3", query: "Explain market structure" }
];

const batchResponse = await axios.post(`${BASE_URL}/api/ai-query/batch`, {
  queries
});
```

### 3. Real-time Monitoring

```javascript
// Connect to WebSocket for live updates
await client.connectWebSocket();

// Monitor training progress, validation results, and system status
// Events are automatically logged to console
```

### 4. Market Analysis

```javascript
const marketData = {
  symbol: "EURUSD",
  timeframe: "1H", 
  current_price: 1.0850,
  recent_highs: [1.0875, 1.0890],
  recent_lows: [1.0820, 1.0835]
};

const analysis = await client.analyzeMarket(marketData, {
  session: "london",
  news_events: ["ECB_MEETING"]
});

console.log("Market Structure:", analysis.market_structure);
console.log("Institutional Bias:", analysis.institutional_bias);
```

### 5. Knowledge Validation

```javascript
// Test AI understanding of ICT concepts
const results = await client.runValidation(
  ["order_blocks", "liquidity", "market_structure"],
  "intermediate"
);

console.log(`Overall Score: ${results.overall_score * 100}%`);
```

## 🐍 Python AI Integration Examples

### OpenAI Fine-tuning

```python
# Generate OpenAI training data
python ai-integration.py openai

# This creates: ict_training_data.jsonl
# Use with: openai api fine_tunes.create -t ict_training_data.jsonl
```

### HuggingFace Integration

```python
# Prepare HuggingFace dataset
python ai-integration.py huggingface

# Load the dataset:
from datasets import Dataset
dataset = Dataset.from_json('ict_hf_dataset.json')
```

### RAG System Setup

```python
# Create RAG knowledge base
python ai-integration.py rag

# Use for context retrieval in your LLM applications
```

### Model Validation

```python
# Validate your AI model's ICT understanding
python ai-integration.py validate
```

## 📊 Performance Testing

### Connection Testing

```bash
# Test all system connections
node test-connection.js

# Quick health check
node test-connection.js --quick
```

### Benchmark Performance

```bash
# Run performance benchmarks
node benchmark.js

# Test specific endpoints
node benchmark.js --endpoint /api/ai-query/process
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if server is running
   curl http://localhost:3000/health
   
   # Start the server if needed
   npm start
   ```

2. **WebSocket Connection Failed**
   ```bash
   # Test WebSocket connectivity
   node test-connection.js
   ```

3. **Slow Response Times**
   ```bash
   # Check system performance
   node test-connection.js
   # Look for response times > 5000ms
   ```

4. **Missing Dependencies**
   ```bash
   # Reinstall dependencies
   npm install
   pip install -r requirements.txt
   ```

### Debug Mode

Enable detailed logging:

```bash
# JavaScript examples
DEBUG=ict:* node basic-usage.js

# Python examples  
LOG_LEVEL=debug python ai-integration.py
```

## 📈 Advanced Usage

### Custom AI Integration

```javascript
// Create custom integration class
class CustomAIIntegration extends ICTKnowledgeClient {
  async trainCustomModel(trainingData) {
    // Your custom training logic
    const embeddings = await this.getEmbeddingsForTraining(trainingData);
    // Process embeddings with your model
  }
  
  async validateCustomModel(testQueries) {
    // Your custom validation logic
    const results = await this.validateAIUnderstanding(testQueries);
    return results;
  }
}
```

### Batch Operations

```javascript
// Process large datasets efficiently
const batchSize = 100;
const queries = [...]; // Your large query list

for (let i = 0; i < queries.length; i += batchSize) {
  const batch = queries.slice(i, i + batchSize);
  const results = await processBatch(batch);
  // Handle results
}
```

### Real-time Analytics

```javascript
// Monitor system metrics in real-time
await client.connectWebSocket();

client.ws.on('message', (data) => {
  const event = JSON.parse(data);
  
  if (event.event === 'system-metrics') {
    updateDashboard(event.data);
  }
});
```

## 🤝 Contributing

To add new examples:

1. Create your example script
2. Add dependencies to `package.json` or `requirements.txt`
3. Update this README with usage instructions
4. Test with the connection test script

## 📞 Support

- 📧 **Issues**: Report bugs or request features
- 📚 **Documentation**: See `/docs/API_DOCUMENTATION.md`
- 💬 **Community**: Join our discussions

## 📄 License

MIT License - see LICENSE file for details.