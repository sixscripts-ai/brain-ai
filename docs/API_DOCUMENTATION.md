# ICT AI Knowledge System - API Documentation

## Overview

The ICT AI Knowledge System provides a comprehensive REST API for training AI models on Inner Circle Trader (ICT) concepts, processing natural language queries, and managing knowledge embeddings. This documentation covers all available endpoints, request/response formats, and usage examples.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication. In production environments, implement appropriate authentication mechanisms.

## Common Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string,
  "message": string,
  "timestamp": string
}
```

## Error Handling

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

Error Response Example:
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Query parameter is required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Health & System Status

### GET /health

Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### GET /api/status

Comprehensive system status including database and knowledge graph statistics.

**Response:**
```json
{
  "database": {
    "connected": true,
    "pool_size": 10,
    "active_connections": 2
  },
  "knowledgeGraph": {
    "nodes": 1250,
    "edges": 3400,
    "categories": ["definitions", "models", "patterns", "techniques"]
  },
  "uptime": 3600.5,
  "memory": {
    "rss": 45678912,
    "heapTotal": 23456789,
    "heapUsed": 12345678
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Knowledge Graph API

### GET /api/knowledge-graph/nodes

Retrieve all nodes or filter by type.

**Query Parameters:**
- `type` (optional): Filter by node type (`definition`, `model`, `pattern`, `technique`)
- `limit` (optional): Maximum number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```
GET /api/knowledge-graph/nodes?type=definition&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "def_1",
      "type": "definition",
      "properties": {
        "term": "Order Block",
        "definition": "A consolidation area where institutional orders are placed",
        "category": "market_structure"
      }
    }
  ],
  "count": 50,
  "total": 245
}
```

### GET /api/knowledge-graph/nodes/:id

Get a specific node by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "def_1",
    "type": "definition",
    "properties": {
      "term": "Order Block",
      "definition": "A consolidation area where institutional orders are placed",
      "category": "market_structure"
    },
    "relationships": [
      {
        "target": "pattern_5",
        "type": "RELATES_TO",
        "properties": {}
      }
    ]
  }
}
```

### GET /api/knowledge-graph/search

Search nodes by term or content.

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): Filter by node type
- `limit` (optional): Maximum results (default: 20)

**Example Request:**
```
GET /api/knowledge-graph/search?q=liquidity&type=definition
```

### GET /api/knowledge-graph/related/:id

Get nodes related to a specific node.

**Query Parameters:**
- `depth` (optional): Relationship depth (default: 1, max: 3)
- `limit` (optional): Maximum results (default: 50)

### POST /api/knowledge-graph/rebuild

Rebuild the entire knowledge graph from database.

**Response:**
```json
{
  "success": true,
  "message": "Knowledge graph rebuilt successfully",
  "statistics": {
    "nodes": 1250,
    "edges": 3400,
    "build_time_ms": 2500
  }
}
```

---

## AI Query Interface

### POST /api/ai-query/process

Process a natural language query about ICT concepts.

**Request Body:**
```json
{
  "query": "What is an order block and how do I identify it?",
  "context": {
    "user_level": "beginner",
    "preferred_style": "detailed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "What is an order block and how do I identify it?",
    "intent": "definition_and_identification",
    "confidence": 0.95,
    "response": "An order block is a consolidation area where institutional traders place large orders...",
    "related_concepts": ["liquidity", "market_structure", "institutional_flow"],
    "suggested_followups": [
      "How do order blocks relate to fair value gaps?",
      "What are the different types of order blocks?"
    ],
    "sources": [
      {
        "type": "definition",
        "id": "def_1",
        "relevance": 0.98
      }
    ]
  }
}
```

### POST /api/ai-query/batch

Process multiple queries in batch.

**Request Body:**
```json
{
  "queries": [
    {
      "id": "q1",
      "query": "What is liquidity?",
      "context": {"user_level": "beginner"}
    },
    {
      "id": "q2", 
      "query": "How do I identify market structure?",
      "context": {"user_level": "intermediate"}
    }
  ]
}
```

### GET /api/ai-query/analytics

Get query processing analytics.

**Query Parameters:**
- `period` (optional): Time period (`day`, `week`, `month`) (default: `day`)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_queries": 1250,
    "avg_response_time_ms": 850,
    "top_intents": [
      {"intent": "definition", "count": 450},
      {"intent": "identification", "count": 320}
    ],
    "success_rate": 0.94
  }
}
```

### POST /api/ai-query/feedback

Submit feedback on query responses.

**Request Body:**
```json
{
  "query_id": "q_12345",
  "rating": 4,
  "feedback": "Very helpful explanation",
  "corrections": []
}
```

### GET /api/ai-query/suggestions

Get suggested queries based on category and user level.

**Query Parameters:**
- `category` (optional): ICT category
- `level` (optional): User experience level

---

## Embeddings System

### POST /api/embeddings/search

Perform semantic search using embeddings.

**Request Body:**
```json
{
  "query": "institutional order flow patterns",
  "options": {
    "limit": 10,
    "threshold": 0.7,
    "types": ["definition", "pattern"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "institutional order flow patterns",
    "results": [
      {
        "id": "def_15",
        "content": "Order flow represents the institutional buying and selling pressure...",
        "similarity": 0.89,
        "metadata": {
          "type": "definition",
          "category": "institutional_flow"
        }
      }
    ],
    "total_results": 8,
    "search_time_ms": 45
  }
}
```

### GET /api/embeddings/similar/:id

Find documents similar to a specific document.

**Query Parameters:**
- `limit` (optional): Maximum results (default: 10)
- `threshold` (optional): Similarity threshold (default: 0.7)

### GET /api/embeddings/document/:id

Retrieve a specific document by ID.

### GET /api/embeddings/documents

Get documents by type or category.

**Query Parameters:**
- `type` (optional): Document type
- `category` (optional): Document category
- `limit` (optional): Maximum results
- `offset` (optional): Pagination offset

### GET /api/embeddings/stats

Get vector store statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_documents": 1250,
    "by_type": {
      "definition": 450,
      "model": 320,
      "pattern": 280,
      "technique": 200
    },
    "embedding_dimensions": 1536,
    "last_updated": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /api/embeddings/refresh

Refresh embeddings from database.

### POST /api/embeddings/export

Export embeddings data.

**Request Body:**
```json
{
  "format": "json",
  "include_embeddings": true
}
```

### POST /api/embeddings/import

Import embeddings data.

### POST /api/embeddings/batch-search

Perform multiple searches in batch.

---

## ICT Reasoning Engine

### POST /api/reasoning/analyze-market

Analyze market conditions using ICT concepts.

**Request Body:**
```json
{
  "market_data": {
    "symbol": "EURUSD",
    "timeframe": "1H",
    "current_price": 1.0850,
    "recent_highs": [1.0875, 1.0890],
    "recent_lows": [1.0820, 1.0835]
  },
  "context": {
    "session": "london",
    "news_events": ["ECB_MEETING"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "market_structure": "bullish",
      "key_levels": {
        "order_blocks": [1.0820, 1.0875],
        "fair_value_gaps": [1.0840, 1.0860],
        "liquidity_zones": [1.0815, 1.0895]
      },
      "institutional_bias": "long",
      "confidence": 0.78
    },
    "reasoning": "Market structure shows higher highs and higher lows...",
    "risk_factors": ["ECB meeting volatility", "London session liquidity"]
  }
}
```

### POST /api/reasoning/generate-decision

Generate trading decision based on analysis.

**Request Body:**
```json
{
  "analysis_id": "analysis_12345",
  "risk_tolerance": "moderate",
  "account_size": 10000,
  "max_risk_percent": 2
}
```

### POST /api/reasoning/validate-decision

Validate a trading decision against ICT principles.

### POST /api/reasoning/explain

Get detailed explanation of reasoning process.

### POST /api/reasoning/scenarios

Generate multiple scenario analyses.

### POST /api/reasoning/position-size

Calculate position size based on risk parameters.

### GET /api/reasoning/performance

Get historical performance metrics.

### POST /api/reasoning/complete-analysis

Perform complete ICT analysis (market + decision + validation).

---

## Knowledge Validation System

### POST /api/validation/generate-questions

Generate validation questions for specific concepts.

**Request Body:**
```json
{
  "concept": "order_blocks",
  "difficulty": "intermediate",
  "count": 5,
  "question_types": ["multiple_choice", "scenario"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q_1",
        "type": "multiple_choice",
        "question": "What characterizes a valid order block?",
        "options": [
          "High volume consolidation area",
          "Random price movement",
          "Low liquidity zone",
          "Trend continuation pattern"
        ],
        "correct_answer": 0,
        "explanation": "Order blocks are characterized by high volume consolidation..."
      }
    ],
    "concept": "order_blocks",
    "difficulty": "intermediate"
  }
}
```

### POST /api/validation/validate-answer

Validate an AI's answer to a question.

**Request Body:**
```json
{
  "question_id": "q_1",
  "ai_answer": "An order block is a consolidation area with high institutional activity...",
  "context": {
    "model": "gpt-4",
    "temperature": 0.7
  }
}
```

### POST /api/validation/run-session

Run a complete validation session.

**Request Body:**
```json
{
  "concepts": ["order_blocks", "liquidity", "market_structure"],
  "difficulty": "intermediate",
  "questions_per_concept": 3
}
```

### GET /api/validation/progress/:concept

Track learning progress for a specific concept.

### GET /api/validation/analytics

Get comprehensive learning analytics.

### POST /api/validation/quick-test

Run a quick validation test with simulated AI answers.

### GET /api/validation/concepts

Get available concepts for validation.

### POST /api/validation/batch-validate

Validate multiple answers in batch.

---

## Knowledge Update System

### GET /api/knowledge-updates/recent

Get recent knowledge updates.

**Query Parameters:**
- `limit` (optional): Maximum results (default: 50)

**Response:**
```json
{
  "success": true,
  "updates": [
    {
      "type": "definition",
      "action": "updated",
      "id": 15,
      "data": {
        "term": "Fair Value Gap",
        "definition": "Updated definition with more clarity..."
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 25
}
```

### GET /api/knowledge-updates/status

Get monitoring status.

### POST /api/knowledge-updates/start-monitoring

Start real-time knowledge monitoring.

**Request Body:**
```json
{
  "interval": 5000
}
```

### POST /api/knowledge-updates/stop-monitoring

Stop real-time knowledge monitoring.

---

## Training Data Generation

### POST /api/training-data/generate

Generate training data for AI models.

**Request Body:**
```json
{
  "types": ["concepts", "qa", "conversations"],
  "outputPath": "./exports/training_data"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Training data generated successfully",
  "summary": {
    "total_files": 8,
    "total_examples": 2500,
    "formats": ["jsonl", "csv", "txt"],
    "size_mb": 15.7
  }
}
```

---

## WebSocket Events

The system provides real-time updates via WebSocket connections at `ws://localhost:3000`.

### Client Events (Send to Server)

#### subscribe
Subscribe to specific update types.
```json
{
  "event": "subscribe",
  "data": {
    "types": ["knowledge-updates", "training-progress", "system-status"]
  }
}
```

#### unsubscribe
Unsubscribe from update types.
```json
{
  "event": "unsubscribe", 
  "data": {
    "types": ["training-progress"]
  }
}
```

### Server Events (Receive from Server)

#### knowledge-update
Real-time knowledge updates.
```json
{
  "event": "knowledge-update",
  "data": {
    "type": "definition",
    "action": "created",
    "id": 156,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### training-data-generation-started
Training data generation started.
```json
{
  "event": "training-data-generation-started",
  "data": {
    "types": ["concepts", "qa"],
    "outputPath": "./exports/training_data"
  }
}
```

#### training-data-generation-completed
Training data generation completed.
```json
{
  "event": "training-data-generation-completed",
  "data": {
    "summary": {
      "total_files": 8,
      "total_examples": 2500
    }
  }
}
```

#### system-status
System status updates.
```json
{
  "event": "system-status",
  "data": {
    "database": {"connected": true},
    "memory_usage": 45.2,
    "active_connections": 12
  }
}
```

---

## Rate Limiting

Current rate limits (per IP):
- General API: 1000 requests/hour
- AI Query Processing: 100 requests/hour
- Training Data Generation: 10 requests/hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

---

## SDK and Client Libraries

### JavaScript/Node.js Example

```javascript
const ICTClient = require('./ict-ai-client');

const client = new ICTClient('http://localhost:3000');

// Process a query
const response = await client.query.process({
  query: "What is an order block?",
  context: { user_level: "beginner" }
});

console.log(response.data.response);
```

### Python Example

```python
import requests

class ICTClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def process_query(self, query, context=None):
        response = requests.post(
            f"{self.base_url}/api/ai-query/process",
            json={"query": query, "context": context or {}}
        )
        return response.json()

client = ICTClient("http://localhost:3000")
result = client.process_query("What is liquidity in ICT?")
print(result["data"]["response"])
```

---

## Deployment Considerations

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ict_knowledge
DATABASE_POOL_SIZE=10

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=3000
NODE_ENV=production

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Checks

The system provides health check endpoints for monitoring:
- `/health` - Basic health check
- `/api/status` - Detailed system status
- `/api/embeddings/health` - Embeddings system health
- `/api/validation/health` - Validation system health

---

## Support and Contributing

For issues, feature requests, or contributions, please refer to the project repository.

### API Versioning

Current API version: `v1`

Future versions will be available at `/api/v2/...` etc.

### Changelog

- `v1.0.0` - Initial release with full ICT knowledge system
- `v1.1.0` - Added real-time knowledge updates
- `v1.2.0` - Enhanced validation system with batch processing