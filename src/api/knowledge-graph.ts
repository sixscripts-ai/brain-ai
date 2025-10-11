import express from 'express';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { AuthService } from '../services/auth';
import { KnowledgeGraphService } from '../knowledge/graph';
import { APIResponse } from '../types';

const router = express.Router();

// Services
let db: SupabaseDatabaseService;
let authService: AuthService;
let knowledgeGraph: KnowledgeGraphService;

// Initialize the services
const initializeServices = async () => {
  if (!db) {
    db = new SupabaseDatabaseService();
    await db.initialize();
    knowledgeGraph = new KnowledgeGraphService(db);
  }
  if (!authService) {
    authService = new AuthService();
  }
};

/**
 * @route GET /api/knowledge-graph
 * @desc Get the complete knowledge graph
 */
router.get('/', async (req, res) => {
  try {
    await initializeServices();
    
    await knowledgeGraph.buildKnowledgeGraph();
    const graph = knowledgeGraph.getGraph();
    
    const response: APIResponse = {
      success: true,
      data: graph,
      message: 'Knowledge graph retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

/**
 * @route GET /api/knowledge-graph/statistics
 * @desc Get knowledge graph statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    initializeServices();
    
    await knowledgeGraph.buildKnowledgeGraph();
    const stats = await knowledgeGraph.getGraphStatistics();
    
    const response: APIResponse = {
      success: true,
      data: stats,
      message: 'Graph statistics retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

/**
 * @route GET /api/knowledge-graph/nodes/:type
 * @desc Get nodes by type
 */
router.get('/nodes/:type', async (req, res) => {
  try {
    initializeServices();
    
    const { type } = req.params;
    await knowledgeGraph.buildKnowledgeGraph();
    const nodes = await knowledgeGraph.findNodesByType(type);
    
    const response: APIResponse = {
      success: true,
      data: nodes,
      message: `Nodes of type '${type}' retrieved successfully`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

/**
 * @route GET /api/knowledge-graph/nodes/:id/related
 * @desc Get related nodes for a specific node
 */
router.get('/nodes/:id/related', async (req, res) => {
  try {
    initializeServices();
    
    const { id } = req.params;
    const maxDepth = parseInt(req.query.depth as string) || 2;
    
    await knowledgeGraph.buildKnowledgeGraph();
    const relatedNodes = await knowledgeGraph.findRelatedNodes(id, maxDepth);
    
    const response: APIResponse = {
      success: true,
      data: relatedNodes,
      message: `Related nodes for '${id}' retrieved successfully`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

/**
 * @route GET /api/knowledge-graph/path/:sourceId/:targetId
 * @desc Find shortest path between two nodes
 */
router.get('/path/:sourceId/:targetId', async (req, res) => {
  try {
    initializeServices();
    
    const { sourceId, targetId } = req.params;
    
    await knowledgeGraph.buildKnowledgeGraph();
    const path = await knowledgeGraph.findShortestPath(sourceId, targetId);
    
    const response: APIResponse = {
      success: true,
      data: {
        path,
        length: path.length,
        source: sourceId,
        target: targetId
      },
      message: `Path from '${sourceId}' to '${targetId}' found`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

/**
 * @route GET /api/knowledge-graph/export/:format
 * @desc Export knowledge graph in different formats
 */
router.get('/export/:format', async (req, res) => {
  try {
    initializeServices();
    
    const { format } = req.params;
    await knowledgeGraph.buildKnowledgeGraph();
    
    let exportData: string;
    let contentType: string;
    let filename: string;
    
    switch (format.toLowerCase()) {
      case 'json':
        exportData = await knowledgeGraph.exportAsJSON();
        contentType = 'application/json';
        filename = 'ict_knowledge_graph.json';
        break;
      case 'graphml':
        exportData = await knowledgeGraph.exportAsGraphML();
        contentType = 'application/xml';
        filename = 'ict_knowledge_graph.graphml';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported export format. Use json or graphml.',
          timestamp: new Date().toISOString()
        });
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
    
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

/**
 * @route POST /api/knowledge-graph/rebuild
 * @desc Rebuild the knowledge graph
 */
router.post('/rebuild', async (req, res) => {
  try {
    initializeServices();
    
    const graph = await knowledgeGraph.buildKnowledgeGraph();
    const stats = await knowledgeGraph.getGraphStatistics();
    
    const response: APIResponse = {
      success: true,
      data: {
        graph_metadata: graph.metadata,
        statistics: stats
      },
      message: 'Knowledge graph rebuilt successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

/**
 * @route GET /api/knowledge-graph/search
 * @desc Search nodes by label or properties
 */
router.get('/search', async (req, res) => {
  try {
    initializeServices();
    
    const { q: query, type, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
        timestamp: new Date().toISOString()
      });
    }
    
    await knowledgeGraph.buildKnowledgeGraph();
    const graph = knowledgeGraph.getGraph();
    
    let results = graph.nodes.filter(node => {
      const matchesQuery = node.label.toLowerCase().includes((query as string).toLowerCase()) ||
                          JSON.stringify(node.properties).toLowerCase().includes((query as string).toLowerCase());
      const matchesType = !type || node.type === type;
      return matchesQuery && matchesType;
    });
    
    // Limit results
    results = results.slice(0, parseInt(limit as string));
    
    const response: APIResponse = {
      success: true,
      data: {
        results,
        total_found: results.length,
        query: query,
        type_filter: type || 'all'
      },
      message: `Found ${results.length} matching nodes`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

export default router;