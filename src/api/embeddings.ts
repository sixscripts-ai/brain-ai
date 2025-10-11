import express from 'express';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { AuthService } from '../services/auth';
import { VectorStore, SearchOptions } from '../embeddings/vector-store';
import { APIResponse } from '../types';

const router = express.Router();

// Initialize services
let dbService: SupabaseDatabaseService;
let authService: AuthService;
let vectorStore: VectorStore;

// Middleware to initialize services
router.use(async (req, res, next) => {
  try {
    if (!dbService) {
      dbService = new SupabaseDatabaseService();
      await dbService.initialize();
    }
    
    if (!authService) {
      authService = new AuthService();
    }
    
    if (!vectorStore) {
      vectorStore = new VectorStore(dbService);
      await vectorStore.initialize();
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to initialize embedding services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/embeddings/search
 * Semantic search using vector embeddings
 */
router.post('/search', async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Query parameter is required and must be a string'
      });
    }
    
    const searchOptions: SearchOptions = {
      limit: options?.limit || 10,
      threshold: options?.threshold || 0.7,
      type: options?.type,
      category: options?.category,
      difficulty: options?.difficulty,
      includeMetadata: options?.includeMetadata !== false
    };
    
    const results = await vectorStore.search(query, searchOptions);
    
    res.json({
      success: true,
      data: {
        query,
        results,
        totalResults: results.length,
        searchOptions
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error performing semantic search:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/embeddings/similar/:documentId
 * Find documents similar to a specific document
 */
router.get('/similar/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { limit, threshold, type, category, difficulty } = req.query;
    
    const options: SearchOptions = {
      limit: limit ? parseInt(limit as string) : 10,
      threshold: threshold ? parseFloat(threshold as string) : 0.7,
      type: type ? (type as string).split(',') : undefined,
      category: category as string,
      difficulty: difficulty as string
    };
    
    const results = await vectorStore.findSimilar(documentId, options);
    
    res.json({
      success: true,
      data: {
        documentId,
        results,
        totalResults: results.length,
        searchOptions: options
      }
    });
  } catch (error) {
    console.error('Error finding similar documents:', error);
    res.status(500).json({
      error: 'Failed to find similar documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/embeddings/document/:id
 * Get a specific document by ID
 */
router.get('/document/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { includeEmbedding } = req.query;
    
    const document = vectorStore.getDocument(id);
    
    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: `No document found with ID: ${id}`
      });
    }
    
    // Remove embedding from response unless specifically requested
    const responseDocument = includeEmbedding === 'true' 
      ? document 
      : { ...document, embedding: undefined };
    
    res.json({
      success: true,
      data: responseDocument
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({
      error: 'Failed to get document',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/embeddings/documents
 * Get documents by type or all documents
 */
router.get('/documents', async (req, res) => {
  try {
    const { type, limit, offset } = req.query;
    
    let documents = type 
      ? vectorStore.getDocumentsByType(type as string)
      : Object.keys(vectorStore.getStatistics().documentsByType).flatMap((docType) => 
          vectorStore.getDocumentsByType(docType)
        );
    
    // Apply pagination
    const startIndex = offset ? parseInt(offset as string) : 0;
    const endIndex = limit ? startIndex + parseInt(limit as string) : documents.length;
    const paginatedDocuments = documents.slice(startIndex, endIndex);
    
    // Remove embeddings from response for performance
    const responseDocuments = paginatedDocuments.map(doc => ({
      ...doc,
      embedding: undefined
    }));
    
    res.json({
      success: true,
      data: {
        documents: responseDocuments,
        pagination: {
          total: documents.length,
          offset: startIndex,
          limit: endIndex - startIndex,
          hasMore: endIndex < documents.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({
      error: 'Failed to get documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/embeddings/statistics
 * Get vector store statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = vectorStore.getStatistics();
    
    res.json({
      success: true,
      data: {
        ...stats,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/embeddings/refresh
 * Refresh embeddings from database
 */
router.post('/refresh', async (req, res) => {
  try {
    await vectorStore.refresh();
    
    const stats = vectorStore.getStatistics();
    
    res.json({
      success: true,
      message: 'Embeddings refreshed successfully',
      data: {
        statistics: stats,
        refreshedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error refreshing embeddings:', error);
    res.status(500).json({
      error: 'Failed to refresh embeddings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/embeddings/export
 * Export embeddings to file
 */
router.post('/export', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'filePath parameter is required'
      });
    }
    
    await vectorStore.exportEmbeddings(filePath);
    
    res.json({
      success: true,
      message: 'Embeddings exported successfully',
      data: {
        filePath,
        exportedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error exporting embeddings:', error);
    res.status(500).json({
      error: 'Failed to export embeddings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/embeddings/import
 * Import embeddings from file
 */
router.post('/import', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'filePath parameter is required'
      });
    }
    
    await vectorStore.importEmbeddings(filePath);
    
    const stats = vectorStore.getStatistics();
    
    res.json({
      success: true,
      message: 'Embeddings imported successfully',
      data: {
        filePath,
        statistics: stats,
        importedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error importing embeddings:', error);
    res.status(500).json({
      error: 'Failed to import embeddings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/embeddings/batch-search
 * Perform multiple searches in batch
 */
router.post('/batch-search', async (req, res) => {
  try {
    const { queries, options } = req.body;
    
    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Queries parameter must be a non-empty array'
      });
    }
    
    if (queries.length > 20) {
      return res.status(400).json({
        error: 'Too many queries',
        message: 'Maximum 20 queries allowed per batch request'
      });
    }
    
    const searchOptions: SearchOptions = {
      limit: options?.limit || 5,
      threshold: options?.threshold || 0.7,
      type: options?.type,
      category: options?.category,
      difficulty: options?.difficulty,
      includeMetadata: options?.includeMetadata !== false
    };
    
    const results = [];
    
    for (const query of queries) {
      try {
        const searchResults = await vectorStore.search(query, searchOptions);
        results.push({
          query,
          results: searchResults,
          success: true
        });
      } catch (error) {
        results.push({
          query,
          results: [],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        results,
        totalQueries: queries.length,
        searchOptions,
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error performing batch search:', error);
    res.status(500).json({
      error: 'Batch search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/embeddings/health
 * Health check for embeddings service
 */
router.get('/health', async (req, res) => {
  try {
    const stats = vectorStore.getStatistics();
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          vectorStore: stats.totalDocuments > 0,
          openai: openaiConfigured,
          database: true // Already checked in middleware
        },
        statistics: stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;