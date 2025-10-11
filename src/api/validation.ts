import express from 'express';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { AuthService } from '../services/auth';
import { VectorStore } from '../embeddings/vector-store';
import { ICTReasoningEngine } from '../reasoning/ict-reasoning-engine';
import { KnowledgeValidator, ValidationQuestion, ValidationResult, ValidationReport } from '../validation/knowledge-validator';
import { APIResponse } from '../types';

const router = express.Router();

// Initialize services
let dbService: SupabaseDatabaseService;
let authService: AuthService;
let vectorStore: VectorStore;
let reasoningEngine: ICTReasoningEngine;
let knowledgeValidator: KnowledgeValidator;

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
    
    if (!reasoningEngine) {
      reasoningEngine = new ICTReasoningEngine(dbService, vectorStore);
    }
    
    if (!knowledgeValidator) {
      knowledgeValidator = new KnowledgeValidator(dbService, vectorStore, reasoningEngine);
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to initialize validation services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/validation/generate-questions
 * Generate validation questions for testing AI knowledge
 */
router.post('/generate-questions', async (req, res) => {
  try {
    const { category, difficulty, count = 10 } = req.body;
    
    if (count > 50) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Maximum 50 questions allowed per request'
      });
    }
    
    const questions = await knowledgeValidator.generateValidationQuestions(
      category,
      difficulty,
      count
    );
    
    res.json({
      success: true,
      data: {
        questions,
        count: questions.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating validation questions:', error);
    res.status(500).json({
      error: 'Question generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/validation/validate-answer
 * Validate a single AI answer against expected answer
 */
router.post('/validate-answer', async (req, res) => {
  try {
    const { question, aiAnswer } = req.body;
    
    if (!question || !aiAnswer) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'question and aiAnswer are required'
      });
    }
    
    const result = await knowledgeValidator.validateAnswer(question, aiAnswer);
    
    res.json({
      success: true,
      data: {
        result,
        validatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({
      error: 'Answer validation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/validation/run-session
 * Run a complete validation session with multiple questions
 */
router.post('/run-session', async (req, res) => {
  try {
    const { questions, aiAnswers } = req.body;
    
    if (!questions || !aiAnswers || !Array.isArray(questions) || !Array.isArray(aiAnswers)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'questions and aiAnswers arrays are required'
      });
    }
    
    if (questions.length !== aiAnswers.length) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Number of questions must match number of answers'
      });
    }
    
    if (questions.length > 50) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Maximum 50 questions allowed per session'
      });
    }
    
    const report = await knowledgeValidator.runValidationSession(questions, aiAnswers);
    
    res.json({
      success: true,
      data: {
        report,
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error running validation session:', error);
    res.status(500).json({
      error: 'Validation session failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/validation/learning-progress/:concept
 * Get learning progress for a specific concept
 */
router.get('/learning-progress/:concept', async (req, res) => {
  try {
    const { concept } = req.params;
    
    if (!concept) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'concept parameter is required'
      });
    }
    
    const progress = await knowledgeValidator.trackLearningProgress(concept);
    
    res.json({
      success: true,
      data: {
        progress,
        retrievedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting learning progress:', error);
    res.status(500).json({
      error: 'Learning progress retrieval failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/validation/analytics
 * Get comprehensive learning analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await knowledgeValidator.getLearningAnalytics();
    
    res.json({
      success: true,
      data: {
        analytics,
        retrievedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting learning analytics:', error);
    res.status(500).json({
      error: 'Learning analytics retrieval failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/validation/quick-test
 * Generate and run a quick validation test
 */
router.post('/quick-test', async (req, res) => {
  try {
    const { 
      category, 
      difficulty = 'intermediate', 
      count = 5,
      aiModel = 'gpt-4' 
    } = req.body;
    
    if (count > 20) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Maximum 20 questions allowed for quick test'
      });
    }
    
    // Generate questions
    const questions = await knowledgeValidator.generateValidationQuestions(
      category,
      difficulty,
      count
    );
    
    if (questions.length === 0) {
      return res.status(404).json({
        error: 'No questions found',
        message: 'No questions available for the specified criteria'
      });
    }
    
    // For demonstration, we'll simulate AI answers
    // In a real implementation, this would call the actual AI model
    const simulatedAnswers = questions.map(q => 
      `This is a simulated answer for: ${q.question}. The concept relates to ${q.concept} in ${q.category}.`
    );
    
    // Run validation session
    const report = await knowledgeValidator.runValidationSession(questions, simulatedAnswers);
    
    res.json({
      success: true,
      data: {
        questions,
        simulatedAnswers,
        report,
        note: 'This is a demonstration with simulated AI answers. In production, integrate with your AI model.',
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error running quick test:', error);
    res.status(500).json({
      error: 'Quick test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/validation/concepts
 * Get available concepts for validation
 */
router.get('/concepts', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        term as concept,
        category,
        difficulty_level as difficulty,
        COUNT(*) OVER (PARTITION BY category) as category_count
      FROM definitions 
      ORDER BY category, term
    `;
    
    const concepts = await dbService.query(query);
    
    // Group by category
    const conceptsByCategory: Record<string, any[]> = {};
    const categories = new Set<string>();
    const difficulties = new Set<string>();
    
    concepts.forEach(concept => {
      if (!conceptsByCategory[concept.category]) {
        conceptsByCategory[concept.category] = [];
      }
      conceptsByCategory[concept.category].push({
        concept: concept.concept,
        difficulty: concept.difficulty
      });
      categories.add(concept.category);
      difficulties.add(concept.difficulty);
    });
    
    res.json({
      success: true,
      data: {
        conceptsByCategory,
        categories: Array.from(categories),
        difficulties: Array.from(difficulties),
        totalConcepts: concepts.length,
        retrievedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting concepts:', error);
    res.status(500).json({
      error: 'Concepts retrieval failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/validation/batch-validate
 * Validate multiple answers in batch
 */
router.post('/batch-validate', async (req, res) => {
  try {
    const { validations } = req.body;
    
    if (!validations || !Array.isArray(validations)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'validations array is required'
      });
    }
    
    if (validations.length > 100) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Maximum 100 validations allowed per batch'
      });
    }
    
    const results: ValidationResult[] = [];
    
    for (const validation of validations) {
      if (!validation.question || !validation.aiAnswer) {
        results.push({
          questionId: validation.question?.id || 'unknown',
          question: validation.question?.question || 'Invalid question',
          aiAnswer: validation.aiAnswer || '',
          expectedAnswer: validation.question?.expectedAnswer || '',
          score: 0,
          feedback: 'Invalid validation data provided',
          conceptsIdentified: [],
          conceptsCorrect: [],
          conceptsMissed: [],
          reasoning: 'Validation skipped due to invalid data',
          timestamp: new Date()
        });
        continue;
      }
      
      try {
        const result = await knowledgeValidator.validateAnswer(
          validation.question,
          validation.aiAnswer
        );
        results.push(result);
      } catch (error) {
        results.push({
          questionId: validation.question.id,
          question: validation.question.question,
          aiAnswer: validation.aiAnswer,
          expectedAnswer: validation.question.expectedAnswer,
          score: 0,
          feedback: 'Validation failed due to processing error',
          conceptsIdentified: [],
          conceptsCorrect: [],
          conceptsMissed: [],
          reasoning: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }
    
    // Calculate batch statistics
    const totalValidations = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalValidations;
    const successfulValidations = results.filter(r => r.score > 0).length;
    
    res.json({
      success: true,
      data: {
        results,
        statistics: {
          totalValidations,
          successfulValidations,
          averageScore,
          failedValidations: totalValidations - successfulValidations
        },
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in batch validation:', error);
    res.status(500).json({
      error: 'Batch validation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/validation/health
 * Health check for validation service
 */
router.get('/health', async (req, res) => {
  try {
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          database: true, // Already checked in middleware
          vectorStore: true, // Already checked in middleware
          reasoningEngine: !!reasoningEngine,
          knowledgeValidator: !!knowledgeValidator,
          openai: openaiConfigured
        },
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