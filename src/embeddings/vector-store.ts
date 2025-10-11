import { aiProvider } from '../services/ai-provider';
import { SupabaseDatabaseService } from '../services/supabase-database';

export interface EmbeddingDocument {
  id: string;
  content: string;
  metadata: {
    type: 'definition' | 'model' | 'pattern' | 'technique' | 'trade' | 'concept';
    source: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    createdAt: string;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: EmbeddingDocument;
  similarity: number;
  relevanceScore: number;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  type?: string[];
  category?: string;
  difficulty?: string;
  includeMetadata?: boolean;
}

export class VectorStore {
  private dbService: SupabaseDatabaseService;
  private documents: Map<string, EmbeddingDocument> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  constructor(dbService: SupabaseDatabaseService) {
    this.dbService = dbService;
    
    // Check if at least one AI provider is available
    const availableProviders = aiProvider.getAvailableProviders();
    if (availableProviders.length === 0) {
      throw new Error('At least one AI provider (OpenAI or Gemini) must be configured');
    }
    
    console.log(`✅ Vector Store initialized with providers: ${availableProviders.join(', ')}`);
  }

  /**
   * Initialize the vector store by loading and embedding all documents
   */
  public async initialize(): Promise<void> {
    console.log('Initializing Vector Store...');
    
    try {
      // Load documents from database
      await this.loadDocumentsFromDatabase();
      
      // Generate embeddings for all documents
      await this.generateAllEmbeddings();
      
      console.log(`Vector Store initialized with ${this.documents.size} documents`);
    } catch (error) {
      console.error('Failed to initialize Vector Store:', error);
      throw error;
    }
  }

  /**
   * Load all documents from the database
   */
  private async loadDocumentsFromDatabase(): Promise<void> {
    try {
      // Load ICT definitions
      const definitions = await this.dbService.getAllDefinitions();
      definitions.forEach((def: any) => {
        const doc: EmbeddingDocument = {
          id: `def_${def.id}`,
          content: `${def.concept}: ${def.definition}`,
          metadata: {
            type: 'definition',
            source: 'ict_definitions',
            category: def.category,
            difficulty: def.difficulty_level as any,
            tags: def.tags ? def.tags.split(',') : [],
            createdAt: def.created_at || new Date().toISOString()
          }
        };
        this.documents.set(doc.id, doc);
      });

      // Load trading models
      const models = await this.dbService.getAllTradingModels();
      models.forEach(model => {
        const doc: EmbeddingDocument = {
          id: `model_${model.id}`,
          content: `${model.model_name}: ${model.description}. Difficulty: ${model.difficulty_level}`,
          metadata: {
            type: 'model',
            source: 'ict_trading_models',
            category: model.difficulty_level,
            difficulty: model.difficulty_level as any,
            tags: model.key_components || [],
            createdAt: model.created_at || new Date().toISOString()
          }
        };
        this.documents.set(doc.id, doc);
      });

      // Load patterns
      const patterns = await this.dbService.getAllPatterns();
      patterns.forEach(pattern => {
        const doc: EmbeddingDocument = {
          id: `pattern_${pattern.id}`,
          content: `${pattern.pattern_name}: ${pattern.description}. Reliability: ${pattern.reliability_score}%`,
          metadata: {
            type: 'pattern',
            source: 'ict_patterns',
            category: pattern.pattern_type,
            difficulty: 'intermediate' as any,
            tags: pattern.best_timeframes || [],
            createdAt: pattern.created_at || new Date().toISOString()
          }
        };
        this.documents.set(doc.id, doc);
      });

      // Load entry techniques
      const techniques = await this.dbService.getAllEntryTechniques();
      techniques.forEach(technique => {
        const doc: EmbeddingDocument = {
          id: `technique_${technique.id}`,
          content: `${technique.technique_name}: ${technique.description}. Risk/Reward: ${technique.risk_reward_ratio}`,
          metadata: {
            type: 'technique',
            source: 'ict_entry_techniques',
            category: technique.difficulty_level,
            difficulty: technique.difficulty_level as any,
            tags: technique.best_timeframes || [],
            createdAt: technique.created_at || new Date().toISOString()
          }
        };
        this.documents.set(doc.id, doc);
      });

      console.log(`Loaded ${this.documents.size} documents from database`);
    } catch (error) {
      console.error('Error loading documents from database:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for all documents
   */
  private async generateAllEmbeddings(): Promise<void> {
    const documents = Array.from(this.documents.values()).filter(doc => !doc.embedding);
    
    if (documents.length === 0) {
      console.log('All documents already have embeddings');
      return;
    }

    // Skip embedding generation if OpenAI API key is not properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-api-key-here')) {
      console.log('OpenAI API key not configured, skipping embedding generation');
      return;
    }

    const batchSize = 100; // OpenAI embedding API batch limit
    
    console.log(`Generating embeddings for ${documents.length} documents...`);
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await this.generateEmbeddingsBatch(batch);
      
      // Add delay to avoid rate limiting
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('All embeddings generated successfully');
  }

  /**
   * Generate embeddings for a batch of documents
   */
  private async generateEmbeddingsBatch(documents: EmbeddingDocument[]): Promise<void> {
    try {
      const texts = documents.map(doc => doc.content);
      
      const embeddings = await aiProvider.createEmbeddingsBatch(texts);

      embeddings.forEach((embeddingResponse: any, index: number) => {
        const doc = documents[index];
        this.embeddings.set(doc.id, embeddingResponse.embedding);
        doc.embedding = embeddingResponse.embedding;
      });
    } catch (error) {
      console.error('Error generating embeddings batch:', error);
      throw error;
    }
  }

  /**
   * Add a new document to the vector store
   */
  public async addDocument(document: EmbeddingDocument): Promise<void> {
    try {
      // Generate embedding for the new document
      const embeddingResponse = await aiProvider.createEmbedding(document.content);

      document.embedding = embeddingResponse.embedding;
      
      // Store document and embedding
      this.documents.set(document.id, document);
      this.embeddings.set(document.id, document.embedding);
      
      console.log(`Added document: ${document.id}`);
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  /**
   * Search for similar documents using semantic similarity
   */
  public async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const embeddingResponse = await aiProvider.createEmbedding(query);

      const queryEmbedding = embeddingResponse.embedding;
      
      // Calculate similarities
      const results: SearchResult[] = [];
      
      for (const [docId, docEmbedding] of this.embeddings.entries()) {
        const document = this.documents.get(docId);
        if (!document) continue;
        
        // Apply filters
        if (options.type && !options.type.includes(document.metadata.type)) continue;
        if (options.category && document.metadata.category !== options.category) continue;
        if (options.difficulty && document.metadata.difficulty !== options.difficulty) continue;
        
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        
        if (similarity >= (options.threshold || 0.7)) {
          results.push({
            document: options.includeMetadata !== false ? document : { ...document, embedding: undefined },
            similarity,
            relevanceScore: this.calculateRelevanceScore(similarity, document, query)
          });
        }
      }
      
      // Sort by relevance score and limit results
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      return results.slice(0, options.limit || 10);
    } catch (error) {
      console.error('Error searching vector store:', error);
      throw error;
    }
  }

  /**
   * Find similar documents to a given document
   */
  public async findSimilar(documentId: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    return this.search(document.content, options);
  }

  /**
   * Get documents by type
   */
  public getDocumentsByType(type: string): EmbeddingDocument[] {
    return Array.from(this.documents.values()).filter(doc => doc.metadata.type === type);
  }

  /**
   * Get document by ID
   */
  public getDocument(id: string): EmbeddingDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Update a document
   */
  public async updateDocument(id: string, updates: Partial<EmbeddingDocument>): Promise<void> {
    const document = this.documents.get(id);
    if (!document) {
      throw new Error(`Document not found: ${id}`);
    }
    
    const updatedDocument = { ...document, ...updates };
    
    // If content changed, regenerate embedding
    if (updates.content && updates.content !== document.content) {
      const embeddingResponse = await aiProvider.createEmbedding(updatedDocument.content);
      
      updatedDocument.embedding = embeddingResponse.embedding;
      this.embeddings.set(id, updatedDocument.embedding);
    }
    
    this.documents.set(id, updatedDocument);
  }

  /**
   * Remove a document
   */
  public removeDocument(id: string): boolean {
    const removed = this.documents.delete(id);
    this.embeddings.delete(id);
    return removed;
  }

  /**
   * Get vector store statistics
   */
  public getStatistics(): {
    totalDocuments: number;
    documentsByType: Record<string, number>;
    documentsByCategory: Record<string, number>;
    documentsByDifficulty: Record<string, number>;
  } {
    const documents = Array.from(this.documents.values());
    
    const stats = {
      totalDocuments: documents.length,
      documentsByType: {} as Record<string, number>,
      documentsByCategory: {} as Record<string, number>,
      documentsByDifficulty: {} as Record<string, number>
    };
    
    documents.forEach(doc => {
      // Count by type
      stats.documentsByType[doc.metadata.type] = (stats.documentsByType[doc.metadata.type] || 0) + 1;
      
      // Count by category
      if (doc.metadata.category) {
        stats.documentsByCategory[doc.metadata.category] = (stats.documentsByCategory[doc.metadata.category] || 0) + 1;
      }
      
      // Count by difficulty
      if (doc.metadata.difficulty) {
        stats.documentsByDifficulty[doc.metadata.difficulty] = (stats.documentsByDifficulty[doc.metadata.difficulty] || 0) + 1;
      }
    });
    
    return stats;
  }

  /**
   * Export embeddings to file
   */
  public async exportEmbeddings(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    
    const exportData = {
      documents: Array.from(this.documents.values()),
      embeddings: Object.fromEntries(this.embeddings.entries()),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalDocuments: this.documents.size,
        embeddingModel: 'text-embedding-3-small'
      }
    };
    
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    console.log(`Embeddings exported to: ${filePath}`);
  }

  /**
   * Import embeddings from file
   */
  public async importEmbeddings(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const importData = JSON.parse(data);
      
      // Clear existing data
      this.documents.clear();
      this.embeddings.clear();
      
      // Import documents
      importData.documents.forEach((doc: EmbeddingDocument) => {
        this.documents.set(doc.id, doc);
      });
      
      // Import embeddings
      Object.entries(importData.embeddings).forEach(([id, embedding]) => {
        this.embeddings.set(id, embedding as number[]);
      });
      
      console.log(`Imported ${this.documents.size} documents from: ${filePath}`);
    } catch (error) {
      console.error('Error importing embeddings:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate relevance score based on similarity and other factors
   */
  private calculateRelevanceScore(similarity: number, document: EmbeddingDocument, query: string): number {
    let score = similarity;
    
    // Boost score for exact keyword matches
    const queryLower = query.toLowerCase();
    const contentLower = document.content.toLowerCase();
    
    if (contentLower.includes(queryLower)) {
      score += 0.1;
    }
    
    // Boost score for title/concept matches
    const firstPart = document.content.split(':')[0].toLowerCase();
    if (firstPart.includes(queryLower) || queryLower.includes(firstPart)) {
      score += 0.15;
    }
    
    // Boost score for tag matches
    if (document.metadata.tags) {
      const matchingTags = document.metadata.tags.filter(tag => 
        queryLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(queryLower)
      );
      score += matchingTags.length * 0.05;
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Get vector store stats (for compatibility)
   */
  public async getStats(): Promise<any> {
    return this.getStatistics();
  }

  /**
   * Refresh embeddings from database
   */
  public async refresh(): Promise<void> {
    console.log('Refreshing vector store...');
    
    // Clear existing data
    this.documents.clear();
    this.embeddings.clear();
    
    // Reload and re-embed
    await this.loadDocumentsFromDatabase();
    await this.generateAllEmbeddings();
    
    console.log('Vector store refreshed successfully');
  }
}