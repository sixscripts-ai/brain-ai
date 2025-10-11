import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
  provider: 'openai' | 'gemini';
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messages: AIMessage[];
}

export interface EmbeddingResponse {
  embedding: number[];
  tokensUsed?: number;
  provider: 'openai' | 'gemini';
}

export type AIProviderType = 'openai' | 'gemini' | 'auto';

export class AIProvider {
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;
  private preferredProvider: AIProviderType;
  private availableProviders: Set<'openai' | 'gemini'> = new Set();

  constructor() {
    this.preferredProvider = (process.env.AI_PROVIDER as AIProviderType) || 'auto';
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key-here')) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.availableProviders.add('openai');
        console.log('✅ OpenAI provider initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize OpenAI provider:', error);
      }
    }

    // Initialize Gemini if API key is available
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-gemini-api-key-here')) {
      try {
        this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.availableProviders.add('gemini');
        console.log('✅ Gemini provider initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Gemini provider:', error);
      }
    }

    if (this.availableProviders.size === 0) {
      console.warn('⚠️ No AI providers available. Please configure OPENAI_API_KEY or GEMINI_API_KEY');
    }
  }

  public getAvailableProviders(): string[] {
    return Array.from(this.availableProviders);
  }

  public isProviderAvailable(provider: 'openai' | 'gemini'): boolean {
    return this.availableProviders.has(provider);
  }

  private selectProvider(): 'openai' | 'gemini' {
    if (this.preferredProvider === 'openai' && this.availableProviders.has('openai')) {
      return 'openai';
    }
    if (this.preferredProvider === 'gemini' && this.availableProviders.has('gemini')) {
      return 'gemini';
    }
    
    // Auto selection: prefer OpenAI, fallback to Gemini
    if (this.availableProviders.has('openai')) {
      return 'openai';
    }
    if (this.availableProviders.has('gemini')) {
      return 'gemini';
    }
    
    throw new Error('No AI providers available');
  }

  public async createChatCompletion(options: AICompletionOptions): Promise<AIResponse> {
    const provider = this.selectProvider();
    
    try {
      if (provider === 'openai') {
        return await this.createOpenAICompletion(options);
      } else {
        return await this.createGeminiCompletion(options);
      }
    } catch (error) {
      console.error(`Error with ${provider} provider:`, error);
      
      // Try fallback provider
      const fallbackProvider = provider === 'openai' ? 'gemini' : 'openai';
      if (this.availableProviders.has(fallbackProvider)) {
        console.log(`🔄 Falling back to ${fallbackProvider} provider`);
        try {
          if (fallbackProvider === 'openai') {
            return await this.createOpenAICompletion(options);
          } else {
            return await this.createGeminiCompletion(options);
          }
        } catch (fallbackError) {
          console.error(`Fallback ${fallbackProvider} provider also failed:`, fallbackError);
        }
      }
      
      throw new Error(`All AI providers failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createOpenAICompletion(options: AICompletionOptions): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI provider not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: options.messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return {
      content,
      tokensUsed: response.usage?.total_tokens,
      model: response.model,
      provider: 'openai'
    };
  }

  private async createGeminiCompletion(options: AICompletionOptions): Promise<AIResponse> {
    if (!this.gemini) {
      throw new Error('Gemini provider not initialized');
    }

    const model = this.gemini.getGenerativeModel({ 
      model: options.model || 'gemini-2.0-flash-exp'
    });

    // Convert messages to Gemini format
    const systemMessage = options.messages.find(m => m.role === 'system');
    const userMessages = options.messages.filter(m => m.role === 'user' || m.role === 'assistant');
    
    let prompt = '';
    if (systemMessage) {
      prompt += `System: ${systemMessage.content}\n\n`;
    }
    
    // Combine user and assistant messages into a single prompt
    userMessages.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response from Gemini');
    }

    return {
      content,
      model: 'gemini-2.0-flash-exp',
      provider: 'gemini'
    };
  }

  public async createEmbedding(text: string): Promise<EmbeddingResponse> {
    const provider = this.selectProvider();
    
    try {
      if (provider === 'openai') {
        return await this.createOpenAIEmbedding(text);
      } else {
        // Gemini doesn't have a direct embedding API, so we'll use OpenAI if available
        // or throw an error if only Gemini is available
        if (this.availableProviders.has('openai')) {
          return await this.createOpenAIEmbedding(text);
        } else {
          throw new Error('Embedding generation requires OpenAI provider');
        }
      }
    } catch (error) {
      console.error(`Error creating embedding with ${provider}:`, error);
      
      // Try OpenAI as fallback for embeddings
      if (provider !== 'openai' && this.availableProviders.has('openai')) {
        console.log('🔄 Falling back to OpenAI for embedding generation');
        return await this.createOpenAIEmbedding(text);
      }
      
      throw error;
    }
  }

  private async createOpenAIEmbedding(text: string): Promise<EmbeddingResponse> {
    if (!this.openai) {
      throw new Error('OpenAI provider not initialized');
    }

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return {
      embedding: response.data[0].embedding,
      tokensUsed: response.usage?.total_tokens,
      provider: 'openai'
    };
  }

  public async createEmbeddingsBatch(texts: string[]): Promise<EmbeddingResponse[]> {
    if (!this.availableProviders.has('openai')) {
      throw new Error('Batch embedding generation requires OpenAI provider');
    }

    if (!this.openai) {
      throw new Error('OpenAI provider not initialized');
    }

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    return response.data.map((embedding, index) => ({
      embedding: embedding.embedding,
      tokensUsed: Math.floor((response.usage?.total_tokens || 0) / texts.length),
      provider: 'openai' as const
    }));
  }

  public getProviderStatus(): {
    preferred: AIProviderType;
    available: string[];
    active: string;
  } {
    return {
      preferred: this.preferredProvider,
      available: Array.from(this.availableProviders),
      active: this.availableProviders.size > 0 ? this.selectProvider() : 'none'
    };
  }
}

// Singleton instance
export const aiProvider = new AIProvider();