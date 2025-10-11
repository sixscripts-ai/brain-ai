import { SupabaseDatabaseService } from '../services/supabase-database';
import { VectorStore } from '../embeddings/vector-store';
import { ICTReasoningEngine } from '../reasoning/ict-reasoning-engine';
import OpenAI from 'openai';

export interface ValidationQuestion {
  id: string;
  category: string;
  concept: string;
  question: string;
  expectedAnswer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'definition' | 'application' | 'analysis' | 'synthesis';
  relatedConcepts: string[];
}

export interface ValidationResult {
  questionId: string;
  question: string;
  aiAnswer: string;
  expectedAnswer: string;
  score: number; // 0-100
  feedback: string;
  conceptsIdentified: string[];
  conceptsCorrect: string[];
  conceptsMissed: string[];
  reasoning: string;
  timestamp: Date;
}

export interface ValidationReport {
  sessionId: string;
  totalQuestions: number;
  averageScore: number;
  categoryScores: Record<string, number>;
  difficultyScores: Record<string, number>;
  conceptMastery: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  results: ValidationResult[];
  timestamp: Date;
}

export interface LearningProgress {
  concept: string;
  category: string;
  masteryLevel: number; // 0-100
  questionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  lastTested: Date;
  improvementTrend: 'improving' | 'stable' | 'declining';
  nextReviewDate: Date;
}

export class KnowledgeValidator {
  private openai: OpenAI;
  private dbService: SupabaseDatabaseService;
  private vectorStore: VectorStore;
  private reasoningEngine: ICTReasoningEngine;

  constructor(
    dbService: SupabaseDatabaseService,
    vectorStore: VectorStore,
    reasoningEngine: ICTReasoningEngine
  ) {
    this.dbService = dbService;
    this.vectorStore = vectorStore;
    this.reasoningEngine = reasoningEngine;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate validation questions based on ICT concepts
   */
  async generateValidationQuestions(
    category?: string,
    difficulty?: string,
    count: number = 10
  ): Promise<ValidationQuestion[]> {
    try {
      // Get concepts from database
      let query = `
        SELECT DISTINCT 
          d.id,
          d.term,
          d.definition,
          d.category,
          d.difficulty_level,
          d.examples,
          d.related_concepts
        FROM definitions d
      `;
      
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (category) {
        conditions.push('d.category = ?');
        params.push(category);
      }
      
      if (difficulty) {
        conditions.push('d.difficulty_level = ?');
        params.push(difficulty);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY RANDOM() LIMIT ?';
      params.push(count);
      
      const concepts = await this.dbService.query(query, params);
      
      const questions: ValidationQuestion[] = [];
      
      for (const concept of concepts) {
        // Generate different types of questions for each concept
        const questionTypes = ['definition', 'application', 'analysis'];
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        const prompt = `
Generate a ${selectedType} question about the ICT trading concept "${concept.term}".

Concept Details:
- Term: ${concept.term}
- Definition: ${concept.definition}
- Category: ${concept.category}
- Difficulty: ${concept.difficulty_level}
- Examples: ${concept.examples || 'None provided'}
- Related Concepts: ${concept.related_concepts || 'None'}

Question Types:
- definition: Test understanding of what the concept means
- application: Test ability to apply the concept in trading scenarios
- analysis: Test ability to analyze market situations using the concept

Generate a clear, specific question and provide the expected answer.
Format as JSON with fields: question, expectedAnswer, relatedConcepts (array)
`;

        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500
        });

        try {
          const questionData = JSON.parse(response.choices[0].message.content || '{}');
          
          questions.push({
            id: `q_${concept.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: concept.category,
            concept: concept.term,
            question: questionData.question,
            expectedAnswer: questionData.expectedAnswer,
            difficulty: concept.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
            type: selectedType as 'definition' | 'application' | 'analysis' | 'synthesis',
            relatedConcepts: questionData.relatedConcepts || []
          });
        } catch (parseError) {
          console.warn('Failed to parse generated question, skipping:', parseError);
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Error generating validation questions:', error);
      throw error;
    }
  }

  /**
   * Validate AI answer against expected answer
   */
  async validateAnswer(
    question: ValidationQuestion,
    aiAnswer: string
  ): Promise<ValidationResult> {
    try {
      const prompt = `
You are an expert ICT trading instructor evaluating an AI student's answer.

Question: ${question.question}
Expected Answer: ${question.expectedAnswer}
AI's Answer: ${aiAnswer}

Concept: ${question.concept}
Category: ${question.category}
Difficulty: ${question.difficulty}
Type: ${question.type}

Evaluate the AI's answer and provide:
1. Score (0-100): How well does the answer match the expected answer?
2. Feedback: Constructive feedback on the answer
3. Concepts Identified: Which ICT concepts were correctly identified in the answer?
4. Concepts Missed: Which important concepts were missed?
5. Reasoning: Explain your scoring rationale

Consider:
- Accuracy of ICT terminology
- Understanding of concept relationships
- Practical application knowledge
- Completeness of the answer
- Clarity of explanation

Format as JSON with fields: score, feedback, conceptsIdentified, conceptsMissed, reasoning
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const evaluation = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        questionId: question.id,
        question: question.question,
        aiAnswer,
        expectedAnswer: question.expectedAnswer,
        score: evaluation.score || 0,
        feedback: evaluation.feedback || 'No feedback provided',
        conceptsIdentified: evaluation.conceptsIdentified || [],
        conceptsCorrect: evaluation.conceptsIdentified || [],
        conceptsMissed: evaluation.conceptsMissed || [],
        reasoning: evaluation.reasoning || 'No reasoning provided',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error validating answer:', error);
      
      // Fallback validation using simple text similarity
      const similarity = this.calculateTextSimilarity(aiAnswer, question.expectedAnswer);
      const score = Math.round(similarity * 100);
      
      return {
        questionId: question.id,
        question: question.question,
        aiAnswer,
        expectedAnswer: question.expectedAnswer,
        score,
        feedback: `Basic similarity score: ${score}%. Detailed evaluation unavailable.`,
        conceptsIdentified: [],
        conceptsCorrect: [],
        conceptsMissed: [],
        reasoning: 'Fallback evaluation due to processing error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Run a complete validation session
   */
  async runValidationSession(
    questions: ValidationQuestion[],
    aiAnswers: string[]
  ): Promise<ValidationReport> {
    try {
      if (questions.length !== aiAnswers.length) {
        throw new Error('Number of questions must match number of answers');
      }

      const results: ValidationResult[] = [];
      
      // Validate each answer
      for (let i = 0; i < questions.length; i++) {
        const result = await this.validateAnswer(questions[i], aiAnswers[i]);
        results.push(result);
      }

      // Calculate statistics
      const totalQuestions = results.length;
      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalQuestions;
      
      // Category scores
      const categoryScores: Record<string, number> = {};
      const categoryGroups = this.groupBy(results, (r, i) => questions[i].category);
      
      for (const [category, categoryResults] of Object.entries(categoryGroups)) {
        categoryScores[category] = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
      }
      
      // Difficulty scores
      const difficultyScores: Record<string, number> = {};
      const difficultyGroups = this.groupBy(results, (r, i) => questions[i].difficulty);
      
      for (const [difficulty, difficultyResults] of Object.entries(difficultyGroups)) {
        difficultyScores[difficulty] = difficultyResults.reduce((sum, r) => sum + r.score, 0) / difficultyResults.length;
      }
      
      // Concept mastery
      const conceptMastery: Record<string, number> = {};
      const conceptGroups = this.groupBy(results, (r, i) => questions[i].concept);
      
      for (const [concept, conceptResults] of Object.entries(conceptGroups)) {
        conceptMastery[concept] = conceptResults.reduce((sum, r) => sum + r.score, 0) / conceptResults.length;
      }
      
      // Identify strengths and weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      
      for (const [category, score] of Object.entries(categoryScores)) {
        if (score >= 80) {
          strengths.push(`Strong understanding of ${category} concepts`);
        } else if (score < 60) {
          weaknesses.push(`Needs improvement in ${category} concepts`);
        }
      }
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(results, questions);
      
      return {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        totalQuestions,
        averageScore,
        categoryScores,
        difficultyScores,
        conceptMastery,
        strengths,
        weaknesses,
        recommendations,
        results,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error running validation session:', error);
      throw error;
    }
  }

  /**
   * Track learning progress over time
   */
  async trackLearningProgress(concept: string): Promise<LearningProgress> {
    try {
      // Get historical validation results for this concept
      const query = `
        SELECT 
          vr.score,
          vr.timestamp,
          vq.concept,
          vq.category
        FROM validation_results vr
        JOIN validation_questions vq ON vr.question_id = vq.id
        WHERE vq.concept = ?
        ORDER BY vr.timestamp DESC
        LIMIT 50
      `;
      
      const results = await this.dbService.query(query, [concept]);
      
      if (results.length === 0) {
        return {
          concept,
          category: 'unknown',
          masteryLevel: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          averageScore: 0,
          lastTested: new Date(),
          improvementTrend: 'stable',
          nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
        };
      }
      
      const questionsAnswered = results.length;
      const correctAnswers = results.filter(r => r.score >= 70).length;
      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / questionsAnswered;
      const masteryLevel = Math.min(100, averageScore + (correctAnswers / questionsAnswered) * 20);
      
      // Calculate improvement trend
      const recentResults = results.slice(0, 10);
      const olderResults = results.slice(10, 20);
      
      let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
      
      if (recentResults.length >= 5 && olderResults.length >= 5) {
        const recentAvg = recentResults.reduce((sum, r) => sum + r.score, 0) / recentResults.length;
        const olderAvg = olderResults.reduce((sum, r) => sum + r.score, 0) / olderResults.length;
        
        if (recentAvg > olderAvg + 5) {
          improvementTrend = 'improving';
        } else if (recentAvg < olderAvg - 5) {
          improvementTrend = 'declining';
        }
      }
      
      // Calculate next review date based on mastery level
      const daysUntilReview = masteryLevel >= 80 ? 14 : masteryLevel >= 60 ? 7 : 3;
      const nextReviewDate = new Date(Date.now() + daysUntilReview * 24 * 60 * 60 * 1000);
      
      return {
        concept,
        category: results[0].category,
        masteryLevel,
        questionsAnswered,
        correctAnswers,
        averageScore,
        lastTested: new Date(results[0].timestamp),
        improvementTrend,
        nextReviewDate
      };
    } catch (error) {
      console.error('Error tracking learning progress:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive learning analytics
   */
  async getLearningAnalytics(): Promise<{
    overallProgress: number;
    conceptProgress: LearningProgress[];
    categoryProgress: Record<string, number>;
    recentSessions: ValidationReport[];
    improvementAreas: string[];
    achievements: string[];
  }> {
    try {
      // Get all unique concepts
      const conceptsQuery = 'SELECT DISTINCT term, category FROM definitions ORDER BY category, term';
      const concepts = await this.dbService.query(conceptsQuery);
      
      // Track progress for each concept
      const conceptProgress: LearningProgress[] = [];
      for (const concept of concepts) {
        const progress = await this.trackLearningProgress(concept.term);
        conceptProgress.push(progress);
      }
      
      // Calculate overall progress
      const overallProgress = conceptProgress.length > 0 
        ? conceptProgress.reduce((sum, p) => sum + p.masteryLevel, 0) / conceptProgress.length
        : 0;
      
      // Calculate category progress
      const categoryProgress: Record<string, number> = {};
      const categoryGroups = this.groupBy(conceptProgress, p => p.category);
      
      for (const [category, categoryProgs] of Object.entries(categoryGroups)) {
        categoryProgress[category] = categoryProgs.reduce((sum, p) => sum + p.masteryLevel, 0) / categoryProgs.length;
      }
      
      // Get recent sessions (mock data for now - would come from stored sessions)
      const recentSessions: ValidationReport[] = [];
      
      // Identify improvement areas
      const improvementAreas = conceptProgress
        .filter(p => p.masteryLevel < 60)
        .sort((a, b) => a.masteryLevel - b.masteryLevel)
        .slice(0, 5)
        .map(p => `${p.concept} (${p.category})`);
      
      // Identify achievements
      const achievements: string[] = [];
      const masteredConcepts = conceptProgress.filter(p => p.masteryLevel >= 90);
      
      if (masteredConcepts.length > 0) {
        achievements.push(`Mastered ${masteredConcepts.length} concepts`);
      }
      
      const improvingConcepts = conceptProgress.filter(p => p.improvementTrend === 'improving');
      if (improvingConcepts.length > 0) {
        achievements.push(`Showing improvement in ${improvingConcepts.length} areas`);
      }
      
      if (overallProgress >= 80) {
        achievements.push('Achieved advanced ICT knowledge level');
      } else if (overallProgress >= 60) {
        achievements.push('Achieved intermediate ICT knowledge level');
      }
      
      return {
        overallProgress,
        conceptProgress,
        categoryProgress,
        recentSessions,
        improvementAreas,
        achievements
      };
    } catch (error) {
      console.error('Error getting learning analytics:', error);
      throw error;
    }
  }

  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(
    results: ValidationResult[],
    questions: ValidationQuestion[]
  ): Promise<string[]> {
    try {
      const weakAreas = results
        .filter(r => r.score < 60)
        .map((r, i) => questions[i].concept);
      
      const recommendations: string[] = [];
      
      if (weakAreas.length > 0) {
        recommendations.push(`Focus on studying: ${weakAreas.slice(0, 3).join(', ')}`);
      }
      
      const categoryScores: Record<string, number[]> = {};
      results.forEach((r, i) => {
        const category = questions[i].category;
        if (!categoryScores[category]) categoryScores[category] = [];
        categoryScores[category].push(r.score);
      });
      
      for (const [category, scores] of Object.entries(categoryScores)) {
        const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        if (avgScore < 70) {
          recommendations.push(`Review ${category} fundamentals`);
        }
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Great job! Continue practicing with advanced scenarios');
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ['Continue studying ICT concepts'];
    }
  }

  /**
   * Calculate text similarity using simple word overlap
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Group array elements by a key function
   */
  private groupBy<T>(array: T[], keyFn: (item: T, index: number) => string): Record<string, T[]> {
    return array.reduce((groups, item, index) => {
      const key = keyFn(item, index);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
}

export default KnowledgeValidator;