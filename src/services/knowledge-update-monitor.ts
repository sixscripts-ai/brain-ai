import { SupabaseDatabaseService } from './supabase-database';
import { VectorStore } from '../embeddings/vector-store';
import WebSocketHandler from '../websocket/websocket-handler';

export interface KnowledgeUpdate {
  type: 'definition' | 'model' | 'pattern' | 'technique';
  action: 'created' | 'updated' | 'deleted';
  id: number;
  data?: any;
  timestamp: string;
}

export interface UpdateSubscription {
  types: string[];
  callback: (update: KnowledgeUpdate) => void;
}

export class KnowledgeUpdateMonitor {
  private dbService: SupabaseDatabaseService;
  private vectorStore: VectorStore;
  private webSocketHandler: WebSocketHandler;
  private subscriptions: Map<string, UpdateSubscription> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastCheckTimestamp: Date = new Date();

  constructor(
    dbService: SupabaseDatabaseService,
    vectorStore: VectorStore,
    webSocketHandler: WebSocketHandler
  ) {
    this.dbService = dbService;
    this.vectorStore = vectorStore;
    this.webSocketHandler = webSocketHandler;
  }

  public startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      console.log('Knowledge update monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.lastCheckTimestamp = new Date();

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkForUpdates();
      } catch (error) {
        console.error('Error checking for knowledge updates:', error);
      }
    }, intervalMs);

    console.log(`Knowledge update monitoring started (interval: ${intervalMs}ms)`);
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Knowledge update monitoring stopped');
  }

  public subscribe(id: string, subscription: UpdateSubscription): void {
    this.subscriptions.set(id, subscription);
    console.log(`Subscription added: ${id} for types: ${subscription.types.join(', ')}`);
  }

  public unsubscribe(id: string): void {
    this.subscriptions.delete(id);
    console.log(`Subscription removed: ${id}`);
  }

  private async checkForUpdates(): Promise<void> {
    const currentTimestamp = new Date();
    
    try {
      // Check for definition updates
      const definitionUpdates = await this.checkDefinitionUpdates();
      
      // Check for model updates
      const modelUpdates = await this.checkModelUpdates();
      
      // Check for pattern updates
      const patternUpdates = await this.checkPatternUpdates();
      
      // Check for technique updates
      const techniqueUpdates = await this.checkTechniqueUpdates();

      const allUpdates = [
        ...definitionUpdates,
        ...modelUpdates,
        ...patternUpdates,
        ...techniqueUpdates
      ];

      if (allUpdates.length > 0) {
        console.log(`Found ${allUpdates.length} knowledge updates`);
        
        // Process updates
        for (const update of allUpdates) {
          await this.processUpdate(update);
        }

        // Broadcast batch update notification
        this.webSocketHandler.broadcast('knowledge-batch-update', {
          count: allUpdates.length,
          types: [...new Set(allUpdates.map(u => u.type))],
          timestamp: currentTimestamp.toISOString()
        });
      }

      this.lastCheckTimestamp = currentTimestamp;
    } catch (error) {
      console.error('Error in checkForUpdates:', error);
    }
  }

  private async checkDefinitionUpdates(): Promise<KnowledgeUpdate[]> {
    const updates: KnowledgeUpdate[] = [];
    
    try {
      const query = `
        SELECT id, term, definition, category, created_at, updated_at
        FROM definitions 
        WHERE updated_at > $1 OR created_at > $1
        ORDER BY COALESCE(updated_at, created_at) DESC
      `;
      
      const result = await this.dbService.query(query, [this.lastCheckTimestamp]);
      
      for (const row of result) {
        const isNew = new Date(row.created_at) > this.lastCheckTimestamp;
        
        updates.push({
          type: 'definition',
          action: isNew ? 'created' : 'updated',
          id: row.id,
          data: {
            term: row.term,
            definition: row.definition,
            category: row.category,
            created_at: row.created_at,
            updated_at: row.updated_at
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking definition updates:', error);
    }
    
    return updates;
  }

  private async checkModelUpdates(): Promise<KnowledgeUpdate[]> {
    const updates: KnowledgeUpdate[] = [];
    
    try {
      const query = `
        SELECT id, name, description, category, created_at, updated_at
        FROM trading_models 
        WHERE updated_at > $1 OR created_at > $1
        ORDER BY COALESCE(updated_at, created_at) DESC
      `;
      
      const result = await this.dbService.query(query, [this.lastCheckTimestamp]);
      
      for (const row of result) {
        const isNew = new Date(row.created_at) > this.lastCheckTimestamp;
        
        updates.push({
          type: 'model',
          action: isNew ? 'created' : 'updated',
          id: row.id,
          data: {
            name: row.name,
            description: row.description,
            category: row.category,
            created_at: row.created_at,
            updated_at: row.updated_at
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking model updates:', error);
    }
    
    return updates;
  }

  private async checkPatternUpdates(): Promise<KnowledgeUpdate[]> {
    const updates: KnowledgeUpdate[] = [];
    
    try {
      const query = `
        SELECT id, name, description, category, created_at, updated_at
        FROM patterns 
        WHERE updated_at > $1 OR created_at > $1
        ORDER BY COALESCE(updated_at, created_at) DESC
      `;
      
      const result = await this.dbService.query(query, [this.lastCheckTimestamp]);
      
      for (const row of result) {
        const isNew = new Date(row.created_at) > this.lastCheckTimestamp;
        
        updates.push({
          type: 'pattern',
          action: isNew ? 'created' : 'updated',
          id: row.id,
          data: {
            name: row.name,
            description: row.description,
            category: row.category,
            created_at: row.created_at,
            updated_at: row.updated_at
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking pattern updates:', error);
    }
    
    return updates;
  }

  private async checkTechniqueUpdates(): Promise<KnowledgeUpdate[]> {
    const updates: KnowledgeUpdate[] = [];
    
    try {
      const query = `
        SELECT id, name, description, category, created_at, updated_at
        FROM techniques 
        WHERE updated_at > $1 OR created_at > $1
        ORDER BY COALESCE(updated_at, created_at) DESC
      `;
      
      const result = await this.dbService.query(query, [this.lastCheckTimestamp]);
      
      for (const row of result) {
        const isNew = new Date(row.created_at) > this.lastCheckTimestamp;
        
        updates.push({
          type: 'technique',
          action: isNew ? 'created' : 'updated',
          id: row.id,
          data: {
            name: row.name,
            description: row.description,
            category: row.category,
            created_at: row.created_at,
            updated_at: row.updated_at
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking technique updates:', error);
    }
    
    return updates;
  }

  private async processUpdate(update: KnowledgeUpdate): Promise<void> {
    try {
      // Notify subscribers
      for (const [id, subscription] of this.subscriptions) {
        if (subscription.types.includes(update.type)) {
          try {
            subscription.callback(update);
          } catch (error) {
            console.error(`Error in subscription callback ${id}:`, error);
          }
        }
      }

      // Broadcast to WebSocket clients
      this.webSocketHandler.broadcast('knowledge-update', update);

      // Update vector store if needed
      if (update.action === 'created' || update.action === 'updated') {
        await this.updateVectorStore(update);
      } else if (update.action === 'deleted') {
        await this.removeFromVectorStore(update);
      }

      console.log(`Processed ${update.type} ${update.action}: ${update.id}`);
    } catch (error) {
      console.error('Error processing update:', error);
    }
  }

  private async updateVectorStore(update: KnowledgeUpdate): Promise<void> {
    try {
      let content = '';
      let metadata: any = {
        type: update.type,
        id: update.id,
        timestamp: update.timestamp
      };

      switch (update.type) {
        case 'definition':
          content = `${update.data.term}: ${update.data.definition}`;
          metadata.term = update.data.term;
          metadata.category = update.data.category;
          break;
        case 'model':
        case 'pattern':
        case 'technique':
          content = `${update.data.name}: ${update.data.description}`;
          metadata.name = update.data.name;
          metadata.category = update.data.category;
          break;
      }

      if (content) {
        // Remove existing document if it exists
        await this.vectorStore.removeDocument(`${update.type}_${update.id}`);
        
        // Add updated document
        await this.vectorStore.addDocument({
          id: `${update.type}_${update.id}`,
          content,
          metadata,
          embedding: [] // Will be generated by addDocument
        });

        console.log(`Updated vector store for ${update.type} ${update.id}`);
      }
    } catch (error) {
      console.error('Error updating vector store:', error);
    }
  }

  private async removeFromVectorStore(update: KnowledgeUpdate): Promise<void> {
    try {
      await this.vectorStore.removeDocument(`${update.type}_${update.id}`);
      console.log(`Removed from vector store: ${update.type} ${update.id}`);
    } catch (error) {
      console.error('Error removing from vector store:', error);
    }
  }

  public async getRecentUpdates(limit: number = 50): Promise<KnowledgeUpdate[]> {
    const updates: KnowledgeUpdate[] = [];
    
    try {
      // Get recent updates from all tables
      const tables = [
        { table: 'definitions', type: 'definition' as const },
        { table: 'trading_models', type: 'model' as const },
        { table: 'patterns', type: 'pattern' as const },
        { table: 'techniques', type: 'technique' as const }
      ];

      for (const { table, type } of tables) {
        const query = `
          SELECT id, created_at, updated_at
          FROM ${table}
          ORDER BY COALESCE(updated_at, created_at) DESC
          LIMIT $1
        `;
        
        const result = await this.dbService.query(query, [limit]);
        
        for (const row of result) {
          const isNew = !row.updated_at || row.updated_at === row.created_at;
          
          updates.push({
            type,
            action: isNew ? 'created' : 'updated',
            id: row.id,
            timestamp: (row.updated_at || row.created_at).toISOString()
          });
        }
      }

      // Sort by timestamp and limit
      return updates
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent updates:', error);
      return [];
    }
  }

  public getMonitoringStatus(): {
    isMonitoring: boolean;
    subscriptionCount: number;
    lastCheckTimestamp: string;
  } {
    return {
      isMonitoring: this.isMonitoring,
      subscriptionCount: this.subscriptions.size,
      lastCheckTimestamp: this.lastCheckTimestamp.toISOString()
    };
  }
}