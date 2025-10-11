import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { VectorStore } from '../embeddings/vector-store';
import { KnowledgeValidator } from '../validation/knowledge-validator';
import { ICTReasoningEngine } from '../reasoning/ict-reasoning-engine';

export interface WebSocketEvents {
  // Client to Server events
  'join_room': (room: string) => void;
  'leave_room': (room: string) => void;
  'subscribe_updates': (types: string[]) => void;
  'unsubscribe_updates': (types: string[]) => void;
  'request_status': () => void;
  
  // Server to Client events
  'validation_complete': (data: any) => void;
  'training_data_generated': (data: any) => void;
  'embeddings_updated': (data: any) => void;
  'knowledge_graph_updated': (data: any) => void;
  'system_status': (data: any) => void;
  'system_error': (data: any) => void;
  'learning_progress_updated': (data: any) => void;
  'real_time_metrics': (data: any) => void;
}

export class WebSocketHandler {
  private io: SocketIOServer;
  private dbService: SupabaseDatabaseService;
  private vectorStore: VectorStore;
  private knowledgeValidator: KnowledgeValidator;
  private reasoningEngine: ICTReasoningEngine;
  private connectedClients: Map<string, any> = new Map();
  private metricsInterval?: NodeJS.Timeout;

  constructor(
    server: HTTPServer,
    dbService: SupabaseDatabaseService,
    vectorStore: VectorStore,
    knowledgeValidator: KnowledgeValidator,
    reasoningEngine: ICTReasoningEngine
  ) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.dbService = dbService;
    this.vectorStore = vectorStore;
    this.knowledgeValidator = knowledgeValidator;
    this.reasoningEngine = reasoningEngine;
    
    this.setupEventHandlers();
    this.startMetricsCollection();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Store client info
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        subscriptions: new Set<string>(),
        rooms: new Set<string>()
      });

      // Send initial system status
      this.sendSystemStatus(socket.id);

      // Handle client events
      socket.on('join_room', (room: string) => {
        socket.join(room);
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.rooms.add(room);
        }
        console.log(`Client ${socket.id} joined room: ${room}`);
      });

      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.rooms.delete(room);
        }
        console.log(`Client ${socket.id} left room: ${room}`);
      });

      socket.on('subscribe_updates', (types: string[]) => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          types.forEach(type => client.subscriptions.add(type));
        }
        console.log(`Client ${socket.id} subscribed to: ${types.join(', ')}`);
      });

      socket.on('unsubscribe_updates', (types: string[]) => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          types.forEach(type => client.subscriptions.delete(type));
        }
        console.log(`Client ${socket.id} unsubscribed from: ${types.join(', ')}`);
      });

      socket.on('request_status', () => {
        this.sendSystemStatus(socket.id);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for client ${socket.id}:`, error);
        this.broadcastSystemError({
          message: 'WebSocket connection error',
          clientId: socket.id,
          error: error.message
        });
      });
    });
  }

  /**
   * Start collecting and broadcasting real-time metrics
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.collectSystemMetrics();
        this.broadcastRealTimeMetrics(metrics);
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, 5000); // Every 5 seconds
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<any> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      timestamp: new Date().toISOString(),
      system: {
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        },
        uptime: Math.round(uptime),
        connectedClients: this.connectedClients.size
      },
      services: {
        database: await this.checkDatabaseHealth(),
        vectorStore: await this.checkVectorStoreHealth(),
        openai: !!process.env.OPENAI_API_KEY
      }
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.dbService.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check vector store health
   */
  private async checkVectorStoreHealth(): Promise<boolean> {
    try {
      await this.vectorStore.getStats();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send system status to a specific client
   */
  private async sendSystemStatus(clientId: string): Promise<void> {
    try {
      const metrics = await this.collectSystemMetrics();
      this.io.to(clientId).emit('system_status', {
        status: 'healthy',
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.io.to(clientId).emit('system_error', {
        message: 'Failed to get system status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Broadcast validation completion
   */
  public broadcastValidationComplete(data: any): void {
    this.broadcast('validation_complete', {
      sessionId: data.sessionId,
      averageScore: data.averageScore,
      totalQuestions: data.totalQuestions,
      categoryScores: data.categoryScores,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast training data generation completion
   */
  public broadcastTrainingDataGenerated(data: any): void {
    this.broadcast('training_data_generated', {
      totalRecords: data.totalRecords,
      formats: data.formats,
      categories: data.categories,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast embeddings update
   */
  public broadcastEmbeddingsUpdated(data: any): void {
    this.broadcast('embeddings_updated', {
      totalEmbeddings: data.totalEmbeddings,
      documentsProcessed: data.documentsProcessed,
      processingTime: data.processingTime,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast knowledge graph update
   */
  public broadcastKnowledgeGraphUpdated(data: any): void {
    this.broadcast('knowledge_graph_updated', {
      nodesCount: data.nodesCount,
      edgesCount: data.edgesCount,
      updateType: data.updateType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast learning progress update
   */
  public broadcastLearningProgressUpdated(data: any): void {
    this.broadcast('learning_progress_updated', {
      concept: data.concept,
      category: data.category,
      masteryLevel: data.masteryLevel,
      improvementTrend: data.improvementTrend,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast system error
   */
  public broadcastSystemError(data: any): void {
    this.broadcast('system_error', {
      message: data.message,
      severity: data.severity || 'error',
      component: data.component,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast real-time metrics
   */
  public broadcastRealTimeMetrics(metrics: any): void {
    this.broadcast('real_time_metrics', metrics);
  }

  /**
   * Send notification to specific room
   */
  public sendToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  /**
   * Send notification to specific client
   */
  public sendToClient(clientId: string, event: string, data: any): void {
    this.io.to(clientId).emit(event, data);
  }

  /**
   * Broadcast to all connected clients with subscription filtering
   */
  broadcast(event: string, data: any): void {
    this.connectedClients.forEach((client, clientId) => {
      // Check if client is subscribed to this type of update
      const eventType = event.split('_')[0]; // e.g., 'validation' from 'validation_complete'
      
      if (client.subscriptions.size === 0 || client.subscriptions.has(eventType) || client.subscriptions.has('all')) {
        this.io.to(clientId).emit(event, data);
      }
    });
  }

  /**
   * Get connected clients info
   */
  public getConnectedClients(): any[] {
    return Array.from(this.connectedClients.values()).map(client => ({
      id: client.id,
      connectedAt: client.connectedAt,
      subscriptions: Array.from(client.subscriptions),
      rooms: Array.from(client.rooms)
    }));
  }

  /**
   * Get WebSocket statistics
   */
  public getStats(): any {
    return {
      connectedClients: this.connectedClients.size,
      totalRooms: this.io.sockets.adapter.rooms.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Shutdown WebSocket server
   */
  public shutdown(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    // Notify all clients about shutdown
    this.io.emit('system_error', {
      message: 'Server is shutting down',
      severity: 'warning',
      timestamp: new Date().toISOString()
    });
    
    // Close all connections
    this.io.close();
    console.log('WebSocket server shut down');
  }
}

export default WebSocketHandler;