#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import compression from 'compression';
import { createServer, Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { SupabaseDatabaseService } from './services/supabase-database';
import { AuthService } from './services/auth';
import { RealtimeService } from './services/realtime';
import { KnowledgeGraphService } from './knowledge/graph';
import { TrainingDataGenerator } from './services/training-data-generator';
import { VectorStore } from './embeddings/vector-store';
import { KnowledgeValidator } from './validation/knowledge-validator';
import { ICTReasoningEngine } from './reasoning/ict-reasoning-engine';
import WebSocketHandler from './websocket/websocket-handler';
import { KnowledgeUpdateMonitor } from './services/knowledge-update-monitor';
import knowledgeGraphRouter from './api/knowledge-graph';
import aiQueryRouter from './api/ai-query';
import embeddingsRouter from './api/embeddings';
import reasoningRouter from './api/reasoning';
import validationRouter from './api/validation';

// Environment configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

class ICTAIKnowledgeSystem {
  private app: express.Application;
  private server: Server;
  private dbService: SupabaseDatabaseService;
  private authService: AuthService;
  private realtimeService: RealtimeService;
  private knowledgeGraph!: KnowledgeGraphService;
  private trainingDataGenerator!: TrainingDataGenerator;
  private vectorStore!: VectorStore;
  private knowledgeValidator!: KnowledgeValidator;
  private reasoningEngine!: ICTReasoningEngine;
  private webSocketHandler!: WebSocketHandler;
  private knowledgeUpdateMonitor!: KnowledgeUpdateMonitor;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    
    this.dbService = new SupabaseDatabaseService();
    this.authService = new AuthService();
    this.realtimeService = new RealtimeService();
    this.knowledgeGraph = new KnowledgeGraphService(this.dbService);
    this.trainingDataGenerator = new TrainingDataGenerator(this.dbService);
  }

  private async initializeServices(): Promise<void> {
    // Initialize training data generator
    this.trainingDataGenerator = new TrainingDataGenerator(this.dbService);
    console.log('Training data generator initialized');

    // Initialize vector store
    this.vectorStore = new VectorStore(this.dbService);
    await this.vectorStore.initialize();
    console.log('Vector store initialized');

    // Initialize knowledge graph
    this.knowledgeGraph = new KnowledgeGraphService(this.dbService);
    console.log('Knowledge graph service initialized');

    // Initialize reasoning engine first (needed by validator)
    this.reasoningEngine = new ICTReasoningEngine(this.dbService, this.vectorStore);
    console.log('ICT reasoning engine initialized');

    // Initialize knowledge validator
    this.knowledgeValidator = new KnowledgeValidator(this.dbService, this.vectorStore, this.reasoningEngine);
    console.log('Knowledge validator initialized');

    // Initialize WebSocket handler (will be set up after server creation)
    console.log('WebSocket handler will be initialized after server creation');

    // Initialize knowledge update monitor (will be set up after WebSocket handler)
    console.log('Knowledge update monitor will be initialized after WebSocket handler');
  }

  private setupMiddleware(): void {
    // Security and performance middleware
    this.app.use(helmet());
    // this.app.use(compression());
    this.app.use(cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Authentication middleware for protected routes
    this.app.use('/api/protected', this.authService.createAuthMiddleware());
    this.app.use('/api/admin', this.authService.createRoleMiddleware(['admin']));

    // Static files
    this.app.use(express.static(path.join(__dirname, '../public')));
    
    // Serve dashboard
    this.app.get('/dashboard', (req, res) => {
      res.sendFile(path.join(__dirname, 'dashboard/dashboard.html'));
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: NODE_ENV
      });
    });

    // Authentication routes
    this.app.post('/api/auth/register', async (req, res) => {
      try {
        const { email, password, fullName } = req.body;
        const result = await this.authService.signUp(email, password, { full_name: fullName });
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(400).json({ 
          error: 'Registration failed', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const result = await this.authService.signIn(email, password);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(401).json({ 
          error: 'Login failed', 
          message: error instanceof Error ? error.message : 'Invalid credentials' 
        });
      }
    });

    this.app.post('/api/auth/logout', this.authService.createAuthMiddleware(), async (req, res) => {
      try {
        await this.authService.signOut();
        res.json({ success: true, message: 'Logged out successfully' });
      } catch (error) {
        res.status(500).json({ 
          error: 'Logout failed', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    // API routes
    this.app.use('/api/knowledge-graph', knowledgeGraphRouter);
    this.app.use('/api/ai-query', aiQueryRouter);
    this.app.use('/api/embeddings', embeddingsRouter);
    this.app.use('/api/reasoning', reasoningRouter);
    this.app.use('/api/validation', validationRouter);

    // System status endpoint
    this.app.get('/api/status', async (req, res) => {
      try {
        const dbHealth = await this.dbService.healthCheck();
        const graphStats = await this.knowledgeGraph.getGraphStatistics();
        
        res.json({
          database: dbHealth,
          knowledgeGraph: graphStats,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: 'System status check failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Training data endpoints
    this.app.post('/api/training-data/generate', async (req, res) => {
      try {
        const { types, outputPath } = req.body;
        
        this.webSocketHandler?.broadcast('training-data-generation-started', { types, outputPath });
        
        if (types && Array.isArray(types)) {
          // Generate specific types
          for (const type of types) {
            switch (type) {
              case 'concepts':
                await this.trainingDataGenerator.generateConceptDefinitionDataset();
                break;
              case 'models':
                await this.trainingDataGenerator.generateTradingModelDataset();
                break;
              case 'patterns':
                await this.trainingDataGenerator.generatePatternRecognitionDataset();
                break;
              case 'decisions':
                await this.trainingDataGenerator.generateTradingDecisionDataset();
                break;
              case 'qa':
                await this.trainingDataGenerator.generateQADataset();
                break;
              case 'conversations':
                await this.trainingDataGenerator.generateConversationalDataset();
                break;
              case 'embeddings':
                await this.trainingDataGenerator.generateEmbeddingTrainingData();
                break;
              case 'reasoning':
                await this.trainingDataGenerator.generateReasoningDataset();
                break;
            }
          }
        } else {
          // Generate all training data
          await this.trainingDataGenerator.generateAllTrainingData();
        }

        const summary = await this.trainingDataGenerator.generateSummaryReport();
        
        this.webSocketHandler?.broadcast('training-data-generation-completed', { summary });
        
        res.json({
          success: true,
          message: 'Training data generated successfully',
          summary
        });
      } catch (error) {
        this.webSocketHandler?.broadcast('training-data-generation-error', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        res.status(500).json({
          error: 'Training data generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Knowledge graph rebuild endpoint
    this.app.post('/api/knowledge-graph/rebuild', async (req, res) => {
      try {
        this.webSocketHandler?.broadcast('knowledge-graph-rebuild-started', {});
        
        await this.knowledgeGraph.buildKnowledgeGraph();
        const stats = await this.knowledgeGraph.getGraphStatistics();
        
        this.webSocketHandler?.broadcast('knowledge-graph-rebuild-completed', { stats });
        
        res.json({
          success: true,
          message: 'Knowledge graph rebuilt successfully',
          statistics: stats
        });
      } catch (error) {
        this.webSocketHandler?.broadcast('knowledge-graph-rebuild-error', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        res.status(500).json({
          error: 'Knowledge graph rebuild failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Knowledge update monitoring endpoints
    this.app.get('/api/knowledge-updates/recent', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const updates = await this.knowledgeUpdateMonitor.getRecentUpdates(limit);
        
        res.json({
          success: true,
          updates,
          count: updates.length
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get recent updates',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.get('/api/knowledge-updates/status', (req, res) => {
      try {
        const status = this.knowledgeUpdateMonitor.getMonitoringStatus();
        res.json({
          success: true,
          ...status
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get monitoring status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.post('/api/knowledge-updates/start-monitoring', (req, res) => {
      try {
        const interval = parseInt(req.body.interval) || 5000;
        this.knowledgeUpdateMonitor.startMonitoring(interval);
        
        res.json({
          success: true,
          message: 'Knowledge update monitoring started',
          interval
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to start monitoring',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.post('/api/knowledge-updates/stop-monitoring', (req, res) => {
      try {
        this.knowledgeUpdateMonitor.stopMonitoring();
        
        res.json({
          success: true,
          message: 'Knowledge update monitoring stopped'
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to stop monitoring',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Catch-all route for SPA
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Error handling middleware
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });
  }

  private setupWebSocket(): void {
    const io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Initialize WebSocket handler
    this.webSocketHandler = new WebSocketHandler(
      io as any,
      this.dbService,
      this.vectorStore,
      this.knowledgeValidator,
      this.reasoningEngine
    );

    // Initialize knowledge update monitor
    this.knowledgeUpdateMonitor = new KnowledgeUpdateMonitor(
      this.dbService,
      this.vectorStore,
      this.webSocketHandler
    );

    // Start real-time knowledge monitoring
    this.knowledgeUpdateMonitor.startMonitoring(5000); // Check every 5 seconds

    console.log('WebSocket handler and knowledge update monitor initialized');
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize Supabase database
      await this.dbService.initialize();
      console.log('Supabase database service initialized');

      // Initialize real-time subscriptions
      this.realtimeService.subscribeToAllChanges();
      console.log('Real-time subscriptions initialized');

      // Initialize knowledge graph
      await this.knowledgeGraph.buildKnowledgeGraph();
      console.log('Knowledge graph built successfully');

      // Initialize additional services
      await this.initializeServices();

      // Setup middleware and routes
      this.setupMiddleware();
      this.setupRoutes();
      this.setupWebSocket();

      console.log('ICT AI Knowledge System with Supabase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ICT AI Knowledge System:', error);
      throw error;
    }
  }

  public start(): void {
    this.server.listen(PORT, () => {
      console.log(`
🚀 ICT AI Knowledge System is running!
📊 Server: http://localhost:${PORT}
🔗 WebSocket: ws://localhost:${PORT}
🌍 Environment: ${NODE_ENV}
📈 Health Check: http://localhost:${PORT}/health
🧠 Knowledge Graph API: http://localhost:${PORT}/api/knowledge-graph
      `);
    });
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down ICT AI Knowledge System...');
    
    // Stop knowledge update monitoring
    if (this.knowledgeUpdateMonitor) {
      this.knowledgeUpdateMonitor.stopMonitoring();
    }
    
    // Close real-time subscriptions
    if (this.realtimeService) {
      this.realtimeService.destroy();
    }
    
    // Close WebSocket connections
    if (this.webSocketHandler) {
      this.webSocketHandler.shutdown();
    }
    
    // Close database connection
    await this.dbService.close();
    
    // Close HTTP server
    this.server.close(() => {
      console.log('ICT AI Knowledge System shut down successfully');
      process.exit(0);
    });
  }
}

// Create and start the application
const app = new ICTAIKnowledgeSystem();

// Graceful shutdown handling
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

// Start the application
if (require.main === module) {
  app.initialize()
    .then(() => app.start())
    .catch((error) => {
      console.error('Failed to start ICT AI Knowledge System:', error);
      process.exit(1);
    });
}

export default ICTAIKnowledgeSystem;