import { SupabaseDatabaseService } from '../services/supabase-database';
import { 
  KnowledgeNode, 
  KnowledgeEdge, 
  KnowledgeGraph,
  ICTDefinition,
  ICTTradingModel,
  ICTEntryTechnique,
  ICTPattern,
  ICTTimeWindow
} from '../types';

export class KnowledgeGraphService {
  private db: SupabaseDatabaseService;
  private graph: KnowledgeGraph;

  constructor(db: SupabaseDatabaseService) {
    this.db = db;
    this.graph = {
      nodes: [],
      edges: [],
      metadata: {
        version: '1.0.0',
        created_at: new Date().toISOString(),
        node_count: 0,
        edge_count: 0
      }
    };
  }

  async buildKnowledgeGraph(): Promise<KnowledgeGraph> {
    console.log('Building knowledge graph from ICT database...');
    
    // Clear existing graph
    this.graph.nodes = [];
    this.graph.edges = [];

    // Build nodes from all ICT entities
    await this.buildDefinitionNodes();
    await this.buildModelNodes();
    await this.buildTechniqueNodes();
    await this.buildPatternNodes();
    await this.buildTimeWindowNodes();

    // Build relationships between nodes
    await this.buildRelationships();

    // Update metadata
    this.graph.metadata.node_count = this.graph.nodes.length;
    this.graph.metadata.edge_count = this.graph.edges.length;
    this.graph.metadata.created_at = new Date().toISOString();

    console.log(`Knowledge graph built: ${this.graph.metadata.node_count} nodes, ${this.graph.metadata.edge_count} edges`);
    return this.graph;
  }

  private async buildDefinitionNodes(): Promise<void> {
    const definitions = await this.db.getAllDefinitions();
    
    for (const def of definitions) {
      const node: KnowledgeNode = {
        id: `def_${def.id}`,
        type: 'concept',
        label: def.concept,
        properties: {
          id: def.id,
          concept: def.concept,
          definition: def.definition,
          key_characteristics: def.key_characteristics,
          market_context: def.market_context,
          usage_notes: def.usage_notes,
          related_concepts: def.related_concepts,
          entity_type: 'definition'
        }
      };
      this.graph.nodes.push(node);
    }
  }

  private async buildModelNodes(): Promise<void> {
    const models = await this.db.getAllTradingModels();
    
    for (const model of models) {
      const node: KnowledgeNode = {
        id: `model_${model.id}`,
        type: 'model',
        label: model.model_name,
        properties: {
          id: model.id,
          model_name: model.model_name,
          description: model.description,
          market_conditions: model.market_conditions,
          entry_criteria: model.entry_criteria,
          exit_criteria: model.exit_criteria,
          risk_management: model.risk_management,
          success_rate: model.success_rate,
          difficulty_level: model.difficulty_level,
          entity_type: 'model'
        }
      };
      this.graph.nodes.push(node);
    }
  }

  private async buildTechniqueNodes(): Promise<void> {
    const techniques = await this.db.getAllEntryTechniques();
    
    for (const technique of techniques) {
      const node: KnowledgeNode = {
        id: `tech_${technique.id}`,
        type: 'technique',
        label: technique.technique_name,
        properties: {
          id: technique.id,
          technique_name: technique.technique_name,
          description: technique.description,
          setup_requirements: technique.setup_requirements,
          entry_trigger: technique.entry_trigger,
          stop_loss_placement: technique.stop_loss_placement,
          take_profit_strategy: technique.take_profit_strategy,
          best_timeframes: technique.best_timeframes,
          risk_reward_ratio: technique.risk_reward_ratio,
          market_sessions: technique.market_sessions,
          difficulty_level: technique.difficulty_level,
          entity_type: 'technique'
        }
      };
      this.graph.nodes.push(node);
    }
  }

  private async buildPatternNodes(): Promise<void> {
    const patterns = await this.db.getAllPatterns();
    
    for (const pattern of patterns) {
      const node: KnowledgeNode = {
        id: `pattern_${pattern.id}`,
        type: 'pattern',
        label: pattern.pattern_name,
        properties: {
          id: pattern.id,
          pattern_name: pattern.pattern_name,
          pattern_type: pattern.pattern_type,
          description: pattern.description,
          identification_rules: pattern.identification_rules,
          trading_strategy: pattern.trading_strategy,
          best_timeframes: pattern.best_timeframes,
          market_context: pattern.market_context,
          examples: pattern.examples,
          reliability_score: pattern.reliability_score,
          entity_type: 'pattern'
        }
      };
      this.graph.nodes.push(node);
    }
  }

  private async buildTimeWindowNodes(): Promise<void> {
    const timeWindows = await this.db.getAllTimeWindows();
    
    for (const window of timeWindows) {
      const node: KnowledgeNode = {
        id: `time_${window.id}`,
        type: 'timewindow',
        label: window.window_name,
        properties: {
          id: window.id,
          window_name: window.window_name,
          start_time: window.start_time,
          end_time: window.end_time,
          description: window.description,
          market_session: window.market_session,
          significance: window.significance,
          trading_opportunities: window.trading_opportunities,
          volatility_level: window.volatility_level,
          entity_type: 'timewindow'
        }
      };
      this.graph.nodes.push(node);
    }
  }

  private async buildRelationships(): Promise<void> {
    // Build concept relationships from related_concepts field
    await this.buildConceptRelationships();
    
    // Build model-technique relationships
    await this.buildModelTechniqueRelationships();
    
    // Build pattern-model relationships
    await this.buildPatternModelRelationships();
    
    // Build timeframe relationships
    await this.buildTimeframeRelationships();
    
    // Build trade-based relationships
    await this.buildTradeBasedRelationships();
  }

  private async buildConceptRelationships(): Promise<void> {
    const definitions = await this.db.getAllDefinitions();
    
    for (const def of definitions) {
      if (def.related_concepts) {
        const relatedConcepts = Array.isArray(def.related_concepts) 
          ? def.related_concepts 
          : [];
        
        for (const relatedConcept of relatedConcepts) {
          const targetNode = this.graph.nodes.find(n => 
            n.type === 'concept' && 
            n.properties.concept?.toLowerCase() === relatedConcept.toLowerCase()
          );
          
          if (targetNode) {
            const edge: KnowledgeEdge = {
              id: `edge_${def.id}_${targetNode.properties.id}`,
              source: `def_${def.id}`,
              target: targetNode.id,
              relationship: 'related_to',
              weight: 0.8,
              properties: {
                type: 'concept_relation',
                bidirectional: true
              }
            };
            this.graph.edges.push(edge);
          }
        }
      }
    }
  }

  private async buildModelTechniqueRelationships(): Promise<void> {
    const models = await this.db.getAllTradingModels();
    const techniques = await this.db.getAllEntryTechniques();
    
    // Create relationships based on keyword matching in descriptions
    for (const model of models) {
      for (const technique of techniques) {
        const similarity = this.calculateTextSimilarity(
          model.description + ' ' + model.entry_criteria,
          technique.description + ' ' + technique.setup_requirements
        );
        
        if (similarity > 0.3) {
          const edge: KnowledgeEdge = {
            id: `edge_model_${model.id}_tech_${technique.id}`,
            source: `model_${model.id}`,
            target: `tech_${technique.id}`,
            relationship: 'uses_technique',
            weight: similarity,
            properties: {
              type: 'model_technique',
              similarity_score: similarity
            }
          };
          this.graph.edges.push(edge);
        }
      }
    }
  }

  private async buildPatternModelRelationships(): Promise<void> {
    const patterns = await this.db.getAllPatterns();
    const models = await this.db.getAllTradingModels();
    
    for (const pattern of patterns) {
      for (const model of models) {
        const similarity = this.calculateTextSimilarity(
          pattern.trading_strategy + ' ' + pattern.market_context,
          model.entry_criteria + ' ' + model.key_components.join(' ')
        );
        
        if (similarity > 0.25) {
          const edge: KnowledgeEdge = {
            id: `edge_pattern_${pattern.id}_model_${model.id}`,
            source: `pattern_${pattern.id}`,
            target: `model_${model.id}`,
            relationship: 'supports_model',
            weight: similarity,
            properties: {
              type: 'pattern_model',
              similarity_score: similarity
            }
          };
          this.graph.edges.push(edge);
        }
      }
    }
  }

  private async buildTimeframeRelationships(): Promise<void> {
    const timeWindows = await this.db.getAllTimeWindows();
    const techniques = await this.db.getAllEntryTechniques();
    
    for (const window of timeWindows) {
      for (const technique of techniques) {
        if (technique.best_timeframes && 
            technique.best_timeframes.some(tf => tf.toLowerCase().includes(window.market_session.toLowerCase()))) {
          const edge: KnowledgeEdge = {
            id: `edge_time_${window.id}_tech_${technique.id}`,
            source: `time_${window.id}`,
            target: `tech_${technique.id}`,
            relationship: 'optimal_for',
            weight: 0.9,
            properties: {
              type: 'timeframe_technique',
              session_match: true
            }
          };
          this.graph.edges.push(edge);
        }
      }
    }
  }

  private async buildTradeBasedRelationships(): Promise<void> {
    // Get trade statistics to build performance-based relationships
    const modelPerformance = await this.db.getModelPerformance();
    const patternPerformance = await this.db.getPatternPerformance();
    
    // Create high-performance relationships
    for (const perf of modelPerformance) {
      if (perf.avg_pnl > 0 && perf.total_trades > 5) {
        const modelNode = this.graph.nodes.find(n => 
          n.type === 'model' && n.properties.model_name === perf.model_used
        );
        
        if (modelNode) {
          // Add performance properties to the node
          modelNode.properties.performance_score = perf.avg_pnl;
          modelNode.properties.trade_count = perf.total_trades;
          modelNode.properties.win_rate = perf.winning_trades / perf.total_trades;
        }
      }
    }
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  // Query methods for the knowledge graph
  async findNodeById(id: string): Promise<KnowledgeNode | undefined> {
    return this.graph.nodes.find(node => node.id === id);
  }

  async findNodesByType(type: string): Promise<KnowledgeNode[]> {
    return this.graph.nodes.filter(node => node.type === type);
  }

  async findRelatedNodes(nodeId: string, maxDepth: number = 2): Promise<KnowledgeNode[]> {
    const visited = new Set<string>();
    const result: KnowledgeNode[] = [];
    
    const traverse = async (currentId: string, depth: number) => {
      if (depth > maxDepth || visited.has(currentId)) return;
      
      visited.add(currentId);
      const currentNode = await this.findNodeById(currentId);
      if (currentNode && currentId !== nodeId) {
        result.push(currentNode);
      }
      
      // Find connected nodes
      const connectedEdges = this.graph.edges.filter(edge => 
        edge.source === currentId || edge.target === currentId
      );
      
      for (const edge of connectedEdges) {
        const nextId = edge.source === currentId ? edge.target : edge.source;
        await traverse(nextId, depth + 1);
      }
    };
    
    await traverse(nodeId, 0);
    return result;
  }

  async findShortestPath(sourceId: string, targetId: string): Promise<KnowledgeNode[]> {
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: sourceId, path: [sourceId] }];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === targetId) {
        const nodes: KnowledgeNode[] = [];
        for (const id of path) {
          const node = await this.findNodeById(id);
          if (node) nodes.push(node);
        }
        return nodes;
      }
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const connectedEdges = this.graph.edges.filter(edge => 
        edge.source === nodeId || edge.target === nodeId
      );
      
      for (const edge of connectedEdges) {
        const nextId = edge.source === nodeId ? edge.target : edge.source;
        if (!visited.has(nextId)) {
          queue.push({ nodeId: nextId, path: [...path, nextId] });
        }
      }
    }
    
    return [];
  }

  async getGraphStatistics(): Promise<any> {
    const nodeTypes = this.graph.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const relationshipTypes = this.graph.edges.reduce((acc, edge) => {
      acc[edge.relationship] = (acc[edge.relationship] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total_nodes: this.graph.nodes.length,
      total_edges: this.graph.edges.length,
      node_types: nodeTypes,
      relationship_types: relationshipTypes,
      avg_connections_per_node: this.graph.edges.length / this.graph.nodes.length,
      graph_density: (2 * this.graph.edges.length) / (this.graph.nodes.length * (this.graph.nodes.length - 1))
    };
  }

  // Export graph in different formats
  async exportAsJSON(): Promise<string> {
    return JSON.stringify(this.graph, null, 2);
  }

  async exportAsGraphML(): Promise<string> {
    let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
    graphml += '  <graph id="ICT_Knowledge_Graph" edgedefault="undirected">\n';
    
    // Add nodes
    for (const node of this.graph.nodes) {
      graphml += `    <node id="${node.id}">\n`;
      graphml += `      <data key="label">${node.label}</data>\n`;
      graphml += `      <data key="type">${node.type}</data>\n`;
      graphml += '    </node>\n';
    }
    
    // Add edges
    for (const edge of this.graph.edges) {
      graphml += `    <edge source="${edge.source}" target="${edge.target}">\n`;
      graphml += `      <data key="relationship">${edge.relationship}</data>\n`;
      graphml += `      <data key="weight">${edge.weight}</data>\n`;
      graphml += '    </edge>\n';
    }
    
    graphml += '  </graph>\n';
    graphml += '</graphml>';
    
    return graphml;
  }

  getGraph(): KnowledgeGraph {
    return this.graph;
  }

  // Alias for findRelatedNodes for backward compatibility
  async getRelatedNodes(nodeId: string, maxDepth: number = 2): Promise<KnowledgeNode[]> {
    return this.findRelatedNodes(nodeId, maxDepth);
  }
}