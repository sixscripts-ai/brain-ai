import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

export interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new?: any;
  old?: any;
  timestamp: string;
}

export interface KnowledgeGraphUpdate {
  type: 'concept_added' | 'concept_updated' | 'concept_deleted' | 'relationship_changed';
  data: any;
  userId?: string;
  timestamp: string;
}

export class RealtimeService extends EventEmitter {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected: boolean = false;

  constructor() {
    super();
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Anon Key are required for real-time functionality');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    // Supabase realtime connection status is handled through channel subscriptions
    // We'll track connection status through successful channel subscriptions
    this.isConnected = true;
    this.emit('connected');
    console.log('Real-time service initialized');
  }

  /**
   * Subscribe to ICT Definitions changes
   */
  public subscribeToDefinitions(callback?: (event: RealtimeEvent) => void): string {
    const channelName = 'ict_definitions_changes';
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ict_definitions'
        },
        (payload) => {
          const event: RealtimeEvent = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: 'ict_definitions',
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString()
          };

          this.emit('definition_change', event);
          if (callback) callback(event);

          // Emit knowledge graph update
          this.emitKnowledgeGraphUpdate({
            type: payload.eventType === 'INSERT' ? 'concept_added' : 
                  payload.eventType === 'UPDATE' ? 'concept_updated' : 'concept_deleted',
            data: payload.new || payload.old,
            timestamp: event.timestamp
          });
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to Trading Models changes
   */
  public subscribeToTradingModels(callback?: (event: RealtimeEvent) => void): string {
    const channelName = 'trading_models_changes';
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ict_trading_models'
        },
        (payload) => {
          const event: RealtimeEvent = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: 'ict_trading_models',
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString()
          };

          this.emit('trading_model_change', event);
          if (callback) callback(event);

          this.emitKnowledgeGraphUpdate({
            type: payload.eventType === 'INSERT' ? 'concept_added' : 
                  payload.eventType === 'UPDATE' ? 'concept_updated' : 'concept_deleted',
            data: payload.new || payload.old,
            timestamp: event.timestamp
          });
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to Knowledge Graph Relationships changes
   */
  public subscribeToKnowledgeGraph(callback?: (event: RealtimeEvent) => void): string {
    const channelName = 'knowledge_graph_changes';
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ict_knowledge_graph'
        },
        (payload) => {
          const event: RealtimeEvent = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: 'ict_knowledge_graph',
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString()
          };

          this.emit('knowledge_graph_change', event);
          if (callback) callback(event);

          this.emitKnowledgeGraphUpdate({
            type: 'relationship_changed',
            data: payload.new || payload.old,
            timestamp: event.timestamp
          });
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to user trades (requires authentication)
   */
  public subscribeToUserTrades(userId: string, callback?: (event: RealtimeEvent) => void): string {
    const channelName = `user_trades_${userId}`;
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ict_trades',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const event: RealtimeEvent = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: 'ict_trades',
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString()
          };

          this.emit('user_trade_change', event);
          if (callback) callback(event);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to vector embeddings changes
   */
  public subscribeToEmbeddings(callback?: (event: RealtimeEvent) => void): string {
    const channelName = 'embeddings_changes';
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ict_vector_embeddings'
        },
        (payload) => {
          const event: RealtimeEvent = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: 'ict_vector_embeddings',
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString()
          };

          this.emit('embedding_change', event);
          if (callback) callback(event);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Subscribe to all ICT-related changes
   */
  public subscribeToAllChanges(): void {
    this.subscribeToDefinitions();
    this.subscribeToTradingModels();
    this.subscribeToKnowledgeGraph();
    this.subscribeToEmbeddings();
  }

  /**
   * Unsubscribe from a specific channel
   */
  public unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  public unsubscribeAll(): void {
    for (const [channelName, channel] of this.channels) {
      this.supabase.removeChannel(channel);
    }
    this.channels.clear();
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get active channels
   */
  public getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Emit knowledge graph update event
   */
  private emitKnowledgeGraphUpdate(update: KnowledgeGraphUpdate): void {
    this.emit('knowledge_graph_update', update);
  }

  /**
   * Broadcast a custom event to all connected clients
   */
  public async broadcastEvent(channel: string, event: string, payload: any): Promise<void> {
    const channelInstance = this.channels.get(channel);
    if (channelInstance) {
      await channelInstance.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  }

  /**
   * Send a presence update
   */
  public async updatePresence(channel: string, state: any): Promise<void> {
    const channelInstance = this.channels.get(channel);
    if (channelInstance) {
      await channelInstance.track(state);
    }
  }

  /**
   * Subscribe to presence changes
   */
  public subscribeToPresence(channelName: string, callback: (presences: any) => void): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.on('presence', { event: 'sync' }, () => {
        const presences = channel.presenceState();
        callback(presences);
      });

      channel.on('presence', { event: 'join' }, ({ newPresences }) => {
        callback(newPresences);
      });

      channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        callback(leftPresences);
      });
    }
  }

  /**
   * Create a collaborative learning session
   */
  public createLearningSession(sessionId: string): string {
    const channelName = `learning_session_${sessionId}`;
    
    const channel = this.supabase
      .channel(channelName)
      .on('broadcast', { event: 'concept_discussion' }, (payload) => {
        this.emit('concept_discussion', payload);
      })
      .on('broadcast', { event: 'question_asked' }, (payload) => {
        this.emit('question_asked', payload);
      })
      .on('broadcast', { event: 'answer_provided' }, (payload) => {
        this.emit('answer_provided', payload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.unsubscribeAll();
    this.removeAllListeners();
    this.supabase.realtime.disconnect();
  }
}

// Singleton instance
let realtimeService: RealtimeService | null = null;

export function getRealtimeService(): RealtimeService {
  if (!realtimeService) {
    realtimeService = new RealtimeService();
  }
  return realtimeService;
}

export default RealtimeService;