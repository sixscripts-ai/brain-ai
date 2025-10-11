# ICT AI Knowledge System - Complete User Guide

## 🚀 Getting Started

Your ICT AI Knowledge System is a powerful trading knowledge platform built with Supabase cloud integration. Here's how to use it effectively:

### Quick Start
1. **System is Running**: http://localhost:3000
2. **Health Check**: http://localhost:3000/health
3. **WebSocket**: ws://localhost:3000

## 🌐 Supabase Integration Features

### Database Connection
Your system uses Supabase PostgreSQL with:
- **10 ICT Trading Tables**: Definitions, models, patterns, techniques, trades
- **Vector Extensions**: For semantic search
- **Real-time Subscriptions**: Live data updates
- **Row-level Security**: Multi-user data protection

### Authentication Ready
```javascript
// User registration/login through Supabase Auth
POST /api/auth/register
POST /api/auth/login
```

## 📡 API Usage Guide

### 1. System Health & Status
```bash
# Check system health
curl http://localhost:3000/health

# Get comprehensive status
curl http://localhost:3000/api/status
```

### 2. AI Query System - Natural Language Trading Queries
```bash
# Ask trading questions in natural language
curl -X POST http://localhost:3000/api/ai-query/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is a Fair Value Gap and how do I trade it?",
    "context": {
      "timeframe": "1H",
      "market": "EURUSD"
    }
  }'

# Get query suggestions
curl http://localhost:3000/api/ai-query/suggestions
```

**Example Trading Queries:**
- "How do I identify an Order Block?"
- "What's the best time to trade London Open?"
- "Explain the Market Structure Shift pattern"
- "Show me high probability entry techniques"

### 3. Knowledge Graph - ICT Concepts & Relationships
```bash
# Get all ICT concepts
curl http://localhost:3000/api/knowledge-graph/concepts

# Find related concepts
curl http://localhost:3000/api/knowledge-graph/related/fair-value-gap

# Get concept details
curl http://localhost:3000/api/knowledge-graph/concept/order-block

# Search concepts
curl "http://localhost:3000/api/knowledge-graph/search?query=liquidity"
```

### 4. Vector Search - Semantic Trading Knowledge
```bash
# Semantic search through ICT knowledge
curl -X POST http://localhost:3000/api/embeddings/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "price action reversal patterns",
    "limit": 5,
    "threshold": 0.8
  }'

# Get similar concepts
curl -X POST http://localhost:3000/api/embeddings/similar \
  -H "Content-Type: application/json" \
  -d '{
    "text": "institutional order flow",
    "limit": 10
  }'
```

### 5. Trading Analysis & Reasoning
```bash
# Analyze market conditions
curl -X POST http://localhost:3000/api/reasoning/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "market": "EURUSD",
    "timeframe": "1H",
    "price": 1.0850,
    "context": "London session open"
  }'

# Get trading recommendations
curl -X POST http://localhost:3000/api/reasoning/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "price at premium discount",
    "bias": "bullish",
    "session": "New York"
  }'
```

### 6. Knowledge Validation
```bash
# Validate trading concepts
curl -X POST http://localhost:3000/api/validation/validate \
  -H "Content-Type: application/json" \
  -d '{
    "concept": "Fair Value Gap",
    "definition": "An imbalance in price action..."
  }'

# Check concept